import {join} from "path";
import {eq} from "drizzle-orm";
import {readFile} from "fs/promises";
import {db} from "@/lib/server/database";
import {createServerOnlyFn} from "@tanstack/react-start";
import {rssFeed as rssFeedTable} from "@/lib/server/database/schema";


export const seedDatabaseWithRssFeeds = createServerOnlyFn(() => async () => {
    const labelsFilePath = join(process.cwd(), "public", "static", "seed-rss-feeds.json");
    const rssFeedsAsString = await readFile(labelsFilePath, "utf-8");
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
})();
