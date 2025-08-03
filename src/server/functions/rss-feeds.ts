import z from "zod";
import {db} from "@/lib/db";
import {createServerFn} from "@tanstack/react-start";
import {createRssFeedSchema} from "@/server/types/types";
import {and, eq, inArray, like, or, sql} from "drizzle-orm";
import {authMiddleware} from "@/server/middlewares/authentication";
import {keyword, rssFeed, user, userRssFeed} from "@/lib/db/schema";
import {fetchAndFilterArticles} from "@/server/utils/fetch-articles";


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


export const rssFeedSearch = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(data => z.string().min(1).parse(data))
    .handler(async ({ data: query, context: { currentUser } }) => {
        const rssSearchResults = await db
            .select()
            .from(rssFeed)
            .where(or(like(rssFeed.publisher, `%${query}%`), like(rssFeed.journal, `%${query}%`)))

        if (!rssSearchResults) {
            return [];
        }

        const userActiveFeeds = await db
            .select({ rssFeedId: userRssFeed.rssFeedId })
            .from(userRssFeed)
            .where(and(
                eq(userRssFeed.userId, currentUser.id),
                inArray(userRssFeed.rssFeedId, rssSearchResults.map((feed) => feed.id))
            ))

        const activeFeedIds = new Set(userActiveFeeds.map(feed => feed.rssFeedId))

        return rssSearchResults.map((result) => ({
            ...result,
            isActive: activeFeedIds.has(result.id),
        }));
    })


export const createRssFeed = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(createRssFeedSchema)
    .handler(async ({ data: { url, journal, publisher }, context: { currentUser } }) => {
        const existingFeed = await db
            .select()
            .from(rssFeed)
            .where(eq(rssFeed.url, url))
            .get();

        if (existingFeed) {
            throw new Error("This RSS feed already exists");
        }

        const [newFeed] = await db
            .insert(rssFeed)
            .values({
                url,
                journal,
                publisher,
            })
            .returning({ id: rssFeed.id })

        await db
            .insert(userRssFeed)
            .values({
                rssFeedId: newFeed.id,
                userId: currentUser.id,
            })
    })


export const addRssFeedsToUser = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(data => z.object({ feedsIds: z.array(z.number().positive()) }).parse(data))
    .handler(async ({ data: { feedsIds }, context: { currentUser } }) => {
        const existingUserFeeds = await db
            .select({ rssFeedId: userRssFeed.rssFeedId })
            .from(userRssFeed)
            .where(and(eq(userRssFeed.userId, currentUser.id), inArray(userRssFeed.rssFeedId, feedsIds)))

        const existingFeedIds = new Set(existingUserFeeds.map((feed) => feed.rssFeedId))
        const newFeedIds = feedsIds.filter((id) => !existingFeedIds.has(id))

        if (newFeedIds.length > 0) {
            const userFeedEntries = newFeedIds.map((feedId) => ({ rssFeedId: feedId, userId: currentUser.id }))
            await db
                .insert(userRssFeed)
                .values(userFeedEntries)
        }
    })


export const removeRssFeedsFromUser = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(data => z.object({ rssIds: z.array(z.number().positive()) }).parse(data))
    .handler(async ({ data: { rssIds }, context: { currentUser } }) => {
        await db
            .delete(userRssFeed)
            .where(and(eq(userRssFeed.userId, currentUser.id), inArray(userRssFeed.rssFeedId, rssIds)))
    })


export const fetchUserRssFeeds = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .handler(async ({ context: { currentUser } }) => {
        const now = new Date();
        const DELTA_MINUTES = 30;

        if (currentUser.lastRssUpdate) {
            const lastUpdate = new Date(currentUser.lastRssUpdate)
            const nextAllowedUpdate = new Date(lastUpdate.getTime() + (DELTA_MINUTES * 60 * 1000))

            if (now < nextAllowedUpdate) {
                const diffInMilliseconds = nextAllowedUpdate.getTime() - now.getTime()
                const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
                return { warn: `RSS Fetcher will be available in ${diffInMinutes} minutes` }
            }
        }

        await db
            .update(user)
            .set({ lastRssUpdate: sql`(CURRENT_TIMESTAMP)` })
            .where(eq(user.id, currentUser.id))

        const activeKeywords = await db
            .select({ name: keyword.name })
            .from(keyword)
            .where(and(eq(keyword.userId, currentUser.id), eq(keyword.active, true)))

        if (activeKeywords.length === 0) {
            return { warn: "At least one active keyword is required to fetch articles" }
        }

        await fetchAndFilterArticles(currentUser.id)
    })
