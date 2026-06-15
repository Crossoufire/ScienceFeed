import {db} from "@/lib/server/database/db";
import {createServerFn} from "@tanstack/react-start";
import {authMiddleware} from "@/lib/server/middlewares/authentication";
import {and, countDistinct, desc, eq, getTableColumns, inArray, like, or, sql, SQL} from "drizzle-orm";
import {article, keyword, rssFeed, userArticle, userArticleKeyword} from "@/lib/server/database/schema";
import {archiveArticlesSchema, deleteArticlesSchema, userArticlesSearchSchema} from "@/lib/schemas/schemas";


export const getUserArticles = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(userArticlesSearchSchema)
    .handler(async ({ data: { page, search, keywordsIds }, context: { currentUser } }) => {
        const perPage = 20;
        const pageNum = page ?? 1;
        const offset = (pageNum - 1) * perPage;

        // Base filtering
        const whereConditions = [
            eq(userArticle.userId, currentUser.id),
            eq(userArticle.isArchived, false),
            eq(userArticle.isDeleted, false),
        ];

        // Add search filtering
        let searchConditions: SQL | undefined = undefined;
        if (search) {
            searchConditions = or(like(article.title, `%${search}%`), like(article.summary, `%${search}%`));
        }

        // Add keyword filtering
        let keywordConditions: SQL[] | undefined;
        if (keywordsIds && keywordsIds.length > 0) {
            keywordConditions = [
                eq(keyword.active, true),
                inArray(keyword.id, keywordsIds),
                eq(keyword.userId, currentUser.id),
            ]
        }
        else {
            keywordConditions = [
                eq(keyword.active, true),
                eq(keyword.userId, currentUser.id),
            ]
        }

        const totalArticles = db
            .select({ count: countDistinct(userArticle.id) })
            .from(userArticle)
            .innerJoin(article, eq(userArticle.articleId, article.id))
            .innerJoin(userArticleKeyword, eq(userArticle.id, userArticleKeyword.userArticleId))
            .innerJoin(keyword, eq(userArticleKeyword.keywordId, keyword.id))
            .where(and(...whereConditions, searchConditions, ...keywordConditions))
            .get()

        const articleRows = await db
            .select({
                ...getTableColumns(userArticle),
                link: article.link,
                title: article.title,
                summary: article.summary,
                journal: rssFeed.journal,
                publisher: rssFeed.publisher,
                keywords: sql<string>`group_concat(distinct ${keyword.name})`,
            })
            .from(userArticle)
            .innerJoin(article, eq(userArticle.articleId, article.id))
            .innerJoin(userArticleKeyword, eq(userArticle.id, userArticleKeyword.userArticleId))
            .innerJoin(keyword, eq(userArticleKeyword.keywordId, keyword.id))
            .innerJoin(rssFeed, eq(article.rssFeedId, rssFeed.id))
            .where(and(...whereConditions, searchConditions, ...keywordConditions))
            .orderBy(desc(userArticle.addedDate))
            .limit(perPage)
            .offset(offset)
            .groupBy(userArticle.id)

        const articleResults = articleRows.map((row) => ({
            ...row,
            keywords: row.keywords ? row.keywords.split(",") : [],
        }));

        // Get user's active keywords that appear in articles
        const userKeywords = await db
            .select({
                id: keyword.id,
                name: keyword.name,
                active: keyword.active,
            })
            .from(keyword)
            .innerJoin(userArticleKeyword, eq(keyword.id, userArticleKeyword.keywordId))
            .innerJoin(userArticle, eq(userArticleKeyword.userArticleId, userArticle.id))
            .where(and(eq(keyword.active, true), eq(keyword.userId, currentUser.id), eq(userArticle.userId, currentUser.id)))
            .groupBy(keyword.id)

        return {
            perPage,
            page: pageNum,
            keywords: userKeywords,
            articles: articleResults,
            total: totalArticles?.count ?? 0,
            pages: Math.ceil((totalArticles?.count ?? 0) / perPage),
        }
    })


export const archiveArticles = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(archiveArticlesSchema)
    .handler(async ({ data: { articleIds, archive }, context: { currentUser } }) => {
        await db
            .update(userArticle)
            .set({ isArchived: archive })
            .where(and(eq(userArticle.userId, currentUser.id), inArray(userArticle.id, articleIds)))
    })


export const deleteArticles = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(deleteArticlesSchema)
    .handler(async ({ data: { isDeleted, articleIds }, context: { currentUser } }) => {
        await db
            .update(userArticle)
            .set({ isDeleted })
            .where(and(eq(userArticle.userId, currentUser.id), inArray(userArticle.id, articleIds)))
    })
