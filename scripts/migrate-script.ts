import {db} from "@/lib/server/database/db";
import {sql} from "drizzle-orm";
import {account, user} from "@/lib/server/database/schema";


async function migrateUsers() {
    console.log("Starting user migration...");

    try {
        const oldUsers: any[] = db.all(sql`SELECT * FROM user_12345`);
        console.log(`Found ${oldUsers.length} users to migrate`);

        for (const oldUser of oldUsers) {
            const [newUser] = await db
                .insert(user)
                .values({
                    id: oldUser.id,
                    email: oldUser.email,
                    name: oldUser.username,
                    emailVerified: oldUser.active,
                    lastRssUpdate: oldUser.last_rss_update,
                    sendFeedEmails: oldUser.send_feed_emails,
                    maxArticlesPerEmail: oldUser.max_articles_per_email,
                }).returning();

            console.log(`Migrated user: ${oldUser.username}`);

            const createdAt = new Date(newUser.createdAt);
            const updatedAt = new Date(newUser.updatedAt);

            await db
                .insert(account)
                // @ts-expect-error - Create account entry for user credentials
                .values({
                    accountId: String(newUser.id),
                    providerId: null,
                    userId: newUser.id,
                    accessToken: null,
                    refreshToken: null,
                    idToken: null,
                    accessTokenExpiresAt: null,
                    refreshTokenExpiresAt: null,
                    scope: null,
                    password: null,
                    createdAt: createdAt,
                    updatedAt: updatedAt,
                });

            console.log(`Created account for user: ${oldUser.username}`);
        }

        console.log("Migration completed successfully!");
    }
    catch (error) {
        console.error("Migration failed:", error);
        throw error;
    }
}


migrateUsers()
    .then(() => console.log("Migration process completed"))
    .catch((err) => {
        console.error("Migration process failed:", err);
        process.exit(1);
    });
