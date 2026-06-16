import pLimit from "p-limit";
import {db} from "@/lib/server/database/db";
import {and, eq, inArray, sql} from "drizzle-orm";
import {article, keyword, rssFeed, user, userArticle, userArticleKeyword, userRssFeed} from "@/lib/server/database/schema";
import {cleanHtmlWithRegex, findMatchingKeywordsRegex, parseRssFeed, RssFetchError, RssItem} from "@/lib/utils/rss-parser";


type Feed = {
    id: number;
    url: string;
    journal: string;
    publisher: string;
}

export type FetchArticlesResult = {
    processedFeeds: number;
    failedFeeds: {
        url: string;
        error: string;
        feedId: number;
        journal: string;
        publisher: string;
    }[];
}

const ACS_FEED_CONCURRENCY = 1;
const ACS_FEED_DELAY_MS = 10_000;
const GENERAL_FEED_CONCURRENCY = 4;


const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


function isAcsFeed(url: string) {
    try {
        return new URL(url).hostname.endsWith("acs.org");
    }
    catch {
        return false;
    }
}


export async function fetchAndFilterArticles(targetUserId?: number): Promise<FetchArticlesResult> {
    const userFilter = targetUserId ? eq(user.id, targetUserId) : undefined;

    const selectedUsers = await db
        .select({ id: user.id })
        .from(user)
        .where(userFilter);

    const result: FetchArticlesResult = {
        processedFeeds: 0,
        failedFeeds: [],
    };

    if (selectedUsers.length === 0) return result;
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
    if (allRssFeedIds.length === 0) return result;

    const feeds = await db
        .select()
        .from(rssFeed)
        .where(inArray(rssFeed.id, allRssFeedIds));

    let lastAcsFetchAt = 0;
    const acsLimit = pLimit(ACS_FEED_CONCURRENCY);
    const generalLimit = pLimit(GENERAL_FEED_CONCURRENCY);

    const waitForAcsFetchSlot = async () => {
        const now = Date.now();
        const nextAllowedAt = lastAcsFetchAt + ACS_FEED_DELAY_MS;
        if (lastAcsFetchAt > 0 && now < nextAllowedAt) {
            await sleep(nextAllowedAt - now);
        }
        lastAcsFetchAt = Date.now();
    };

    let acsCloudflareChallengeSeen = false;
    const parsedById = new Map<number, { feed: Feed; parsed: RssItem[] }>();
    await Promise.all(feeds.map((f) =>
        (isAcsFeed(f.url) ? acsLimit : generalLimit)(async () => {
            const feedIsAcs = isAcsFeed(f.url);

            try {
                if (feedIsAcs) {
                    if (acsCloudflareChallengeSeen) {
                        throw new RssFetchError(
                            `Skipped ACS RSS feed ${f.url}. Earlier ACS request in this refresh hit a Cloudflare challenge`,
                            undefined,
                            true,
                        );
                    }

                    await waitForAcsFetchSlot();
                }

                const parsed = await parseRssFeed(f.url);
                parsedById.set(f.id, { feed: f, parsed });
                result.processedFeeds++;

                await db
                    .update(rssFeed)
                    .set({
                        lastFetchError: null,
                        lastFetchDate: sql`(CURRENT_TIMESTAMP)`,
                    })
                    .where(eq(rssFeed.id, f.id));
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown RSS fetch error";
                if (feedIsAcs && error instanceof RssFetchError && error.isCloudflareChallenge) {
                    acsCloudflareChallengeSeen = true;
                }

                await db
                    .update(rssFeed)
                    .set({
                        lastFetchError: errorMessage,
                        lastFetchDate: sql`(CURRENT_TIMESTAMP)`,
                    })
                    .where(eq(rssFeed.id, f.id));

                result.failedFeeds.push({
                    url: f.url,
                    feedId: f.id,
                    journal: f.journal,
                    error: errorMessage,
                    publisher: f.publisher,
                });
            }
        }),
    ));

    const allLinks = new Set<string>();
    for (const { parsed } of parsedById.values()) {
        for (const item of parsed) {
            if (item.link) allLinks.add(item.link);
        }
    }
    const linkList = Array.from(allLinks);
    const existingArticles = linkList.length ?
        await db
            .select()
            .from(article)
            .where(inArray(article.link, linkList))
        :
        [];

    const linkToArticleId = new Map<string, number>();
    for (const a of existingArticles) {
        linkToArticleId.set(a.link, a.id);
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

        type UAItem = { articleLink: string; articleId?: number };
        const pendingUA: UAItem[] = [];

        const linkToMatchedKwNames = new Map<string, Set<string>>();

        for (const feedId of feedIds) {
            const bundle = parsedById.get(feedId);
            if (!bundle) continue;

            const { feed, parsed } = bundle;
            for (const item of parsed) {
                if (!item.title || !item.link) continue;

                const matched = findMatchingKeywordsRegex(activeKwNames, item);
                if (!matched || matched.length === 0) continue;

                const set = linkToMatchedKwNames.get(item.link) ?? new Set<string>();
                matched.forEach((m: string) => set.add(m));
                linkToMatchedKwNames.set(item.link, set);

                if (!linkToArticleId.has(item.link)) {
                    pendingArticles.push({
                        link: item.link,
                        title: item.title,
                        rssFeedId: feed.id,
                        summary: cleanHtmlWithRegex(item.description ?? ""),
                    });
                }

                pendingUA.push({ articleLink: item.link });
            }
        }

        if (pendingArticles.length === 0 && pendingUA.length === 0 && linkToMatchedKwNames.size === 0) {
            continue;
        }

        await db.transaction(async (tx) => {
            if (pendingArticles.length > 0) {
                const seenLinks = new Set<string>();
                const toInsert = pendingArticles.filter((a) => {
                    if (linkToArticleId.has(a.link)) return false;
                    if (seenLinks.has(a.link)) return false;
                    seenLinks.add(a.link);
                    return true;
                });

                if (toInsert.length > 0) {
                    await tx
                        .insert(article)
                        .values(toInsert)

                    const justLinks = toInsert.map((a) => a.link);
                    const newArticles = await tx
                        .select()
                        .from(article)
                        .where(inArray(article.link, justLinks));

                    for (const a of newArticles) {
                        linkToArticleId.set(a.link, a.id);
                    }
                }
            }

            const uaToInsert: { userId: number; articleId: number }[] = [];
            for (const item of pendingUA) {
                const aId = linkToArticleId.get(item.articleLink);
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

            for (const [link, kwNamesSet] of linkToMatchedKwNames) {
                const aId = linkToArticleId.get(link);
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

    return result;
}
