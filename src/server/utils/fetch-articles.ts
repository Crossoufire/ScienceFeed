import {db} from "@/lib/db";
import pLimit from "p-limit";
import {and, eq, inArray} from "drizzle-orm";
import {article, keyword, rssFeed, user, userArticle, userArticleKeyword, userRssFeed} from "@/lib/db/schema";
import {cleanHtmlWithRegex, findMatchingKeywordsRegex, parseRssFeed, RssItem} from "@/server/utils/rss-parser";


type Feed = {
    id: number;
    url: string;
    journal: string;
    publisher: string;
}


export async function fetchAndFilterArticles(targetUserId?: number) {
    const userFilter = targetUserId ? eq(user.id, targetUserId) : undefined;

    const selectedUsers = await db
        .select({ id: user.id })
        .from(user)
        .where(userFilter);

    if (selectedUsers.length === 0) return;
    const userIds = selectedUsers.map((u) => u.id);

    const userRssRows = await db
        .select()
        .from(userRssFeed)
        .where(inArray(userRssFeed.userId, userIds));

    const userToFeedIds = new Map<number, number[]>();
    for (const row of userRssRows) {
        const arr = userToFeedIds.get(row.userId) ?? [];
        arr.push(row.rssFeedId);
        userToFeedIds.set(row.userId, arr);
    }

    const userKeywords = await db
        .select()
        .from(keyword)
        .where(and(inArray(keyword.userId, userIds), eq(keyword.active, true)));

    const userToActiveKeywords = new Map<number, { id: number; name: string }[]>();
    for (const kw of userKeywords) {
        const arr = userToActiveKeywords.get(kw.userId) ?? [];
        arr.push({ id: kw.id, name: kw.name });
        userToActiveKeywords.set(kw.userId, arr);
    }

    const allRssFeedIds = Array.from(new Set(userRssRows.map((r) => r.rssFeedId)));
    if (allRssFeedIds.length === 0) return;

    const feeds = await db
        .select()
        .from(rssFeed)
        .where(inArray(rssFeed.id, allRssFeedIds));

    const limit = pLimit(4);
    const parsedById = new Map<number, { feed: Feed; parsed: RssItem[] }>();
    await Promise.all(feeds.map((f) =>
        limit(async () => {
            const parsed = await parseRssFeed(f.url);
            parsedById.set(f.id, { feed: f, parsed });
        }),
    ));

    const allTitles = new Set<string>();
    for (const { parsed } of parsedById.values()) {
        for (const item of parsed) {
            if (item.title) allTitles.add(item.title);
        }
    }
    const titleList = Array.from(allTitles);
    const existingArticles = titleList.length ?
        await db
            .select()
            .from(article)
            .where(inArray(article.title, titleList))
        :
        [];

    const titleToArticleId = new Map<string, number>();
    for (const a of existingArticles) {
        titleToArticleId.set(a.title, a.id);
    }

    const existingUserArticles = await db
        .select()
        .from(userArticle)
        .where(inArray(userArticle.userId, userIds));

    const userToArticleSet = new Map<number, Set<number>>();
    for (const ua of existingUserArticles) {
        const set = userToArticleSet.get(ua.userId) ?? new Set<number>();
        set.add(ua.articleId);
        userToArticleSet.set(ua.userId, set);
    }

    for (const user of selectedUsers) {
        const feedIds = userToFeedIds.get(user.id) ?? [];
        const activeKws = userToActiveKeywords.get(user.id) ?? [];
        if (activeKws.length === 0) continue;

        const activeKwNames = activeKws.map((k) => k.name);
        const userArticleSet =
            userToArticleSet.get(user.id) ?? new Set<number>();

        const pendingArticles: {
            rssFeedId: number;
            title: string;
            link: string;
            summary: string;
        }[] = [];

        type UAItem = { articleTitle: string; articleId?: number };
        const pendingUA: UAItem[] = [];

        const titleToMatchedKwNames = new Map<string, Set<string>>();

        for (const feedId of feedIds) {
            const bundle = parsedById.get(feedId);
            if (!bundle) continue;

            const { feed, parsed } = bundle;
            for (const item of parsed) {
                if (!item.title || !item.link) continue;

                const matched = findMatchingKeywordsRegex(activeKwNames, item);
                if (!matched || matched.length === 0) continue;

                const set = titleToMatchedKwNames.get(item.title) ?? new Set<string>();
                matched.forEach((m: string) => set.add(m));
                titleToMatchedKwNames.set(item.title, set);

                if (!titleToArticleId.has(item.title)) {
                    pendingArticles.push({
                        link: item.link,
                        title: item.title,
                        rssFeedId: feed.id,
                        summary: cleanHtmlWithRegex(item.description ?? ""),
                    });
                }

                pendingUA.push({ articleTitle: item.title });
            }
        }

        if (pendingArticles.length === 0 && pendingUA.length === 0 && titleToMatchedKwNames.size === 0) {
            continue;
        }

        await db.transaction(async (tx) => {
            if (pendingArticles.length > 0) {
                const seenTitles = new Set<string>();
                const toInsert = pendingArticles.filter((a) => {
                    if (titleToArticleId.has(a.title)) return false;
                    if (seenTitles.has(a.title)) return false;
                    seenTitles.add(a.title);
                    return true;
                });

                if (toInsert.length > 0) {
                    await tx
                        .insert(article)
                        .values(toInsert)

                    const justTitles = toInsert.map((a) => a.title);
                    const newArticles = await tx
                        .select()
                        .from(article)
                        .where(inArray(article.title, justTitles));

                    for (const a of newArticles) {
                        titleToArticleId.set(a.title, a.id);
                    }
                }
            }

            const uaToInsert: { userId: number; articleId: number }[] = [];
            for (const item of pendingUA) {
                const aId = titleToArticleId.get(item.articleTitle);
                if (aId == null) continue;
                if (!userArticleSet.has(aId)) {
                    uaToInsert.push({ userId: user.id, articleId: aId });
                    userArticleSet.add(aId);
                }
            }

            if (uaToInsert.length > 0) {
                await tx.insert(userArticle).values(uaToInsert);
            }

            const userUaRows = await tx
                .select()
                .from(userArticle)
                .where(eq(userArticle.userId, user.id));

            const articleIdToUserArticleId = new Map<number, number>();
            for (const ua of userUaRows) {
                articleIdToUserArticleId.set(ua.articleId, ua.id);
            }

            const uaIds = userUaRows.map((ua) => ua.id);
            let existingKwRels: { userArticleId: number; keywordId: number }[] = [];
            if (uaIds.length > 0) {
                existingKwRels = await tx
                    .select({
                        userArticleId: userArticleKeyword.userArticleId,
                        keywordId: userArticleKeyword.keywordId,
                    })
                    .from(userArticleKeyword)
                    .where(inArray(userArticleKeyword.userArticleId, uaIds));
            }
            const existingRelSet = new Set<string>();
            for (const r of existingKwRels) {
                existingRelSet.add(`${r.userArticleId}:${r.keywordId}`);
            }

            const kwNameToId = new Map(activeKws.map((k) => [k.name, k.id]));
            const relsToInsert: { userArticleId: number; keywordId: number }[] = [];

            for (const [title, kwNamesSet] of titleToMatchedKwNames) {
                const aId = titleToArticleId.get(title);
                if (aId == null) continue;
                const uaId = articleIdToUserArticleId.get(aId);
                if (uaId == null) continue;

                for (const kwName of kwNamesSet) {
                    const kwId = kwNameToId.get(kwName);
                    if (kwId == null) continue;
                    const key = `${uaId}:${kwId}`;
                    if (!existingRelSet.has(key)) {
                        relsToInsert.push({ userArticleId: uaId, keywordId: kwId });
                        existingRelSet.add(key);
                    }
                }
            }

            if (relsToInsert.length > 0) {
                await tx
                    .insert(userArticleKeyword)
                    .values(relsToInsert);
            }
        });

        userToArticleSet.set(user.id, userArticleSet);
    }
}
