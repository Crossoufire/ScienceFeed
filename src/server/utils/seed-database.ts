import {join} from "path";
import {db} from "@/lib/db";
import {eq} from "drizzle-orm";
import {readFileSync} from "node:fs";
import {rssFeed as rssFeedTable} from "@/lib/db/schema";


export const seedDatabaseWithRssFeeds = async () => {
    const labelsFilePath = join(process.cwd(), "public", "static", "seed-rss-feeds.json");
    const rssFeedsAsString = readFileSync(labelsFilePath, "utf-8");
    const rssFeedsToSeed: { data: { publisher: string, url: string, journal: string }[] } = JSON.parse(rssFeedsAsString);


    for (const rssFeed of rssFeedsToSeed.data) {
        const existingRssFeed = await db
            .select()
            .from(rssFeedTable)
            .where(eq(rssFeedTable.url, rssFeed.url))
            .get();

        if (existingRssFeed) {
            await db
                .update(rssFeedTable)
                .set({ ...rssFeed })
                .where(eq(rssFeedTable.url, rssFeed.url));
        }
        else {
            await db
                .insert(rssFeedTable)
                .values({ ...rssFeed });
        }
    }
};
