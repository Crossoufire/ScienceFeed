import Database from "bun:sqlite";
import {serverEnv} from "@/env/server";


const sqlite = new Database(serverEnv.DATABASE_URL);


const tableExists = (name: string) => {
    const row = sqlite
        .query("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?")
        .get(name);

    return Boolean(row);
};


const columnNames = (table: string) => {
    return sqlite
        .query(`PRAGMA table_info(${table})`)
        .all()
        .map((row: any) => row.name as string);
};


const assertNoDuplicateRows = (label: string, sql: string) => {
    const duplicate = sqlite.query(sql).get();

    if (duplicate) {
        throw new Error(`Cannot migrate: duplicate ${label} rows exist: ${JSON.stringify(duplicate)}`);
    }
};


function removeOrphanRows() {
    sqlite.run(`
        DELETE FROM user_article_keyword
        WHERE keyword_id NOT IN (SELECT id FROM keyword) OR user_article_id NOT IN (SELECT id FROM user_article)
    `);

    sqlite.run(`
        DELETE FROM keyword
        WHERE user_id NOT IN (SELECT id FROM user)
    `);

    sqlite.run(`
        DELETE FROM user_article
        WHERE user_id NOT IN (SELECT id FROM user) OR article_id NOT IN (SELECT id FROM article)
    `);

    sqlite.run(`
        DELETE FROM user_article_keyword
        WHERE keyword_id NOT IN (SELECT id FROM keyword) OR user_article_id NOT IN (SELECT id FROM user_article)
    `);

    sqlite.run(`
        DELETE FROM user_rss_feed
        WHERE user_id NOT IN (SELECT id FROM user) OR rss_feed_id NOT IN (SELECT id FROM rss_feed)
    `);

    sqlite.run(`
        UPDATE article
        SET rss_feed_id = NULL
        WHERE rss_feed_id IS NOT NULL AND rss_feed_id NOT IN (SELECT id FROM rss_feed)
    `);
}


function dedupeRowsForUniqueIndexes() {
    sqlite.run(`
        CREATE TEMP TABLE IF NOT EXISTS duplicate_article_map AS
        SELECT
            article.id AS duplicate_id,
            canonical.keep_id AS keep_id
        FROM article
        INNER JOIN (
            SELECT link, min(id) AS keep_id
            FROM article
            GROUP BY link
            HAVING count(*) > 1
        ) canonical ON canonical.link = article.link
        WHERE article.id != canonical.keep_id
    `);

    sqlite.run(`
        UPDATE user_article
        SET article_id = (
            SELECT keep_id
            FROM duplicate_article_map
            WHERE duplicate_article_map.duplicate_id = user_article.article_id
        )
        WHERE article_id IN (SELECT duplicate_id FROM duplicate_article_map)
    `);

    sqlite.run("DELETE FROM article WHERE id IN (SELECT duplicate_id FROM duplicate_article_map)");

    sqlite.run(`
        CREATE TEMP TABLE IF NOT EXISTS duplicate_keyword_map AS
        SELECT
            keyword.id AS duplicate_id,
            canonical.keep_id AS keep_id
        FROM keyword
        INNER JOIN (
            SELECT user_id, name, min(id) AS keep_id
            FROM keyword
            GROUP BY user_id, name
            HAVING count(*) > 1
        ) canonical ON canonical.user_id = keyword.user_id AND canonical.name = keyword.name
        WHERE keyword.id != canonical.keep_id
    `);

    sqlite.run(`
        UPDATE user_article_keyword
        SET keyword_id = (
            SELECT keep_id
            FROM duplicate_keyword_map
            WHERE duplicate_keyword_map.duplicate_id = user_article_keyword.keyword_id
        )
        WHERE keyword_id IN (SELECT duplicate_id FROM duplicate_keyword_map)
    `);

    sqlite.run("DELETE FROM keyword WHERE id IN (SELECT duplicate_id FROM duplicate_keyword_map)");

    sqlite.run(`
        DELETE FROM user_article_keyword
        WHERE rowid NOT IN (
            SELECT min(rowid)
            FROM user_article_keyword
            GROUP BY user_article_id, keyword_id
        )
    `);

    sqlite.run(`
        CREATE TEMP TABLE IF NOT EXISTS duplicate_user_article_map AS
        SELECT
            user_article.id AS duplicate_id,
            canonical.keep_id AS keep_id
        FROM user_article
        INNER JOIN (
            SELECT user_id, article_id, min(id) AS keep_id
            FROM user_article
            GROUP BY user_id, article_id
            HAVING count(*) > 1
        ) canonical ON canonical.user_id = user_article.user_id AND canonical.article_id = user_article.article_id
        WHERE user_article.id != canonical.keep_id
    `);

    sqlite.run(`
        UPDATE user_article_keyword
        SET user_article_id = (
            SELECT keep_id
            FROM duplicate_user_article_map
            WHERE duplicate_user_article_map.duplicate_id = user_article_keyword.user_article_id
        )
        WHERE user_article_id IN (SELECT duplicate_id FROM duplicate_user_article_map)
    `);

    sqlite.run("DELETE FROM user_article WHERE id IN (SELECT duplicate_id FROM duplicate_user_article_map)");

    sqlite.run(`
        DELETE FROM user_article_keyword
        WHERE rowid NOT IN (
            SELECT min(rowid)
            FROM user_article_keyword
            GROUP BY user_article_id, keyword_id
        )
    `);

    sqlite.run(`
        DELETE FROM user_rss_feed
        WHERE id NOT IN (
            SELECT min(id)
            FROM user_rss_feed
            GROUP BY user_id, rss_feed_id
        )
    `);
}


function assertUniqueIndexPreconditions() {
    assertNoDuplicateRows(
        "article.link",
        "SELECT link, count(*) AS count FROM article GROUP BY link HAVING count(*) > 1 LIMIT 1",
    );
    assertNoDuplicateRows(
        "keyword(user_id, name)",
        "SELECT user_id, name, count(*) AS count FROM keyword GROUP BY user_id, name HAVING count(*) > 1 LIMIT 1",
    );
    assertNoDuplicateRows(
        "user_rss_feed(user_id, rss_feed_id)",
        "SELECT user_id, rss_feed_id, count(*) AS count FROM user_rss_feed GROUP BY user_id, rss_feed_id HAVING count(*) > 1 LIMIT 1",
    );
    assertNoDuplicateRows(
        "user_article(user_id, article_id)",
        "SELECT user_id, article_id, count(*) AS count FROM user_article GROUP BY user_id, article_id HAVING count(*) > 1 LIMIT 1",
    );
    assertNoDuplicateRows(
        "user_article_keyword(user_article_id, keyword_id)",
        "SELECT user_article_id, keyword_id, count(*) AS count FROM user_article_keyword GROUP BY user_article_id, keyword_id HAVING count(*) > 1 LIMIT 1",
    );
}


function migrateUsersTable() {
    if (!tableExists("user")) {
        throw new Error("Cannot migrate: user table does not exist");
    }

    const userColumns = columnNames("user");

    if (!userColumns.includes("username")) {
        console.log("User table already appears to use the Better Auth schema.");
        return;
    }

    if (!tableExists("legacy_user")) {
        sqlite.run("CREATE TABLE legacy_user AS SELECT * FROM user");
    }

    sqlite.run(`
        CREATE TABLE user_new (
            id integer PRIMARY KEY AUTOINCREMENT,
            name text NOT NULL,
            image text,
            email text NOT NULL UNIQUE,
            last_rss_update text,
            created_at integer NOT NULL,
            updated_at integer NOT NULL,
            email_verified integer NOT NULL
        )
    `);

    sqlite.run(`
        INSERT INTO user_new (
            id,
            name,
            image,
            email,
            last_rss_update,
            created_at,
            updated_at,
            email_verified
        )
        SELECT
            id,
            username,
            NULL,
            email,
            last_rss_update,
            COALESCE(unixepoch(registered_on), unixepoch('now')),
            COALESCE(unixepoch(last_seen), unixepoch(registered_on), unixepoch('now')),
            CASE WHEN active THEN 1 ELSE 0 END
        FROM legacy_user
    `);

    sqlite.run("DROP TABLE user");
    sqlite.run("ALTER TABLE user_new RENAME TO user");
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS user_email_unique ON user(email)");

    const migratedUsers = sqlite.query("SELECT count(*) AS count FROM user").get() as { count: number };
    console.log(`Migrated ${migratedUsers.count} user(s) to Better Auth user schema.`);
}


function createBetterAuthTables() {
    sqlite.run(`
        CREATE TABLE IF NOT EXISTS account (
            id integer PRIMARY KEY AUTOINCREMENT,
            account_id text NOT NULL,
            provider_id text NOT NULL,
            user_id integer NOT NULL REFERENCES user(id) ON DELETE cascade,
            access_token text,
            refresh_token text,
            id_token text,
            access_token_expires_at integer,
            refresh_token_expires_at integer,
            scope text,
            password text,
            created_at integer NOT NULL,
            updated_at integer NOT NULL
        )
    `);

    sqlite.run(`
        CREATE TABLE IF NOT EXISTS session (
            id integer PRIMARY KEY AUTOINCREMENT,
            token text NOT NULL UNIQUE,
            ip_address text,
            user_agent text,
            expires_at integer NOT NULL,
            created_at integer NOT NULL,
            updated_at integer NOT NULL,
            user_id integer NOT NULL REFERENCES user(id) ON DELETE cascade
        )
    `);

    sqlite.run(`
        CREATE TABLE IF NOT EXISTS verification (
            id integer PRIMARY KEY,
            identifier text NOT NULL,
            value text NOT NULL,
            expires_at integer NOT NULL,
            created_at integer,
            updated_at integer
        )
    `);
}


function createAppIndexes() {
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS ux_article_link ON article(link)");
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS ux_keyword_user_name ON keyword(user_id, name)");
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_rss_feed_user_feed ON user_rss_feed(user_id, rss_feed_id)");
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_article_user_article ON user_article(user_id, article_id)");
    sqlite.run("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_article_keyword_article_keyword ON user_article_keyword(user_article_id, keyword_id)");
}


function migrateRssFeedFetchStatusColumns() {
    const rssFeedColumns = columnNames("rss_feed");

    if (!rssFeedColumns.includes("last_fetch_date")) {
        sqlite.run("ALTER TABLE rss_feed ADD COLUMN last_fetch_date text");
    }

    if (!rssFeedColumns.includes("last_fetch_error")) {
        sqlite.run("ALTER TABLE rss_feed ADD COLUMN last_fetch_error text");
    }
}


function archiveLegacyTokenTable() {
    if (!tableExists("token")) {
        return;
    }

    if (!tableExists("legacy_token")) {
        sqlite.run("CREATE TABLE legacy_token AS SELECT * FROM token");
    }

    sqlite.run("DROP TABLE token");
    console.log("Archived old token table as legacy_token. Old password/token sessions are not migrated.");
}


function migrateDatabase() {
    console.log("Migrating database...");

    sqlite.run("PRAGMA foreign_keys = OFF");
    sqlite.transaction(() => {
        removeOrphanRows();
        dedupeRowsForUniqueIndexes();
        removeOrphanRows();
        assertUniqueIndexPreconditions();
        migrateUsersTable();
        removeOrphanRows();
        archiveLegacyTokenTable();
        createBetterAuthTables();
        migrateRssFeedFetchStatusColumns();
        createAppIndexes();
    })();
    sqlite.run("PRAGMA foreign_keys = ON");

    const foreignKeyIssues = sqlite.query("PRAGMA foreign_key_check").all();
    if (foreignKeyIssues.length > 0) {
        throw new Error(`Migration finished with foreign key issues: ${JSON.stringify(foreignKeyIssues)}`);
    }

    console.log("Migration completed successfully.");
}


try {
    migrateDatabase();
} finally {
    sqlite.close();
}
