import {db} from "@/lib/db";
import {createServerFn} from "@tanstack/react-start";
import {rssFeed, userRssFeed} from "@/lib/db/schema";
import {and, eq, inArray, like, or} from "drizzle-orm";
import {authMiddleware} from "@/server/middlewares/authentication";


export const getUserRssFeeds = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context: { currentUser } }) => {
        const userRssFeeds = await db
            .select({
                id: userRssFeed.id,
                userId: userRssFeed.userId,
                rssFeedId: userRssFeed.rssFeedId,
                url: rssFeed.url,
                journal: rssFeed.journal,
                publisher: rssFeed.publisher,
            })
            .from(userRssFeed)
            .innerJoin(rssFeed, eq(userRssFeed.rssFeedId, rssFeed.id))
            .where(eq(userRssFeed.userId, currentUser.id))

        return userRssFeeds;
    })


export const searchRssFeeds = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator((data: { q?: string }) => ({ q: data.q || "" }))
    .handler(async ({ data: { q }, context: { currentUser } }) => {
        const searchResults = await db
            .select()
            .from(rssFeed)
            .where(or(like(rssFeed.publisher, `%${q}%`), like(rssFeed.journal, `%${q}%`)))

        if (!searchResults) {
            return [];
        }

        const userActiveFeeds = await db
            .select({ rssFeedId: userRssFeed.rssFeedId })
            .from(userRssFeed)
            .where(and(
                eq(userRssFeed.userId, currentUser.id),
                inArray(userRssFeed.rssFeedId, searchResults.map(feed => feed.id))
            ))

        const activeFeedIds = new Set(userActiveFeeds.map(feed => feed.rssFeedId))

        return searchResults.map((result) => ({ ...result, isActive: activeFeedIds.has(result.id) }))
    })
