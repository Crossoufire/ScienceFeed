import {sql} from "drizzle-orm";
import {relations} from "drizzle-orm/relations";
import {user} from "@/lib/db/schema/auth.schema";
import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";


export const rssFeed = sqliteTable("rss_feed", {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    publisher: text().notNull(),
    journal: text().notNull(),
    url: text().unique().notNull(),
});


export const keyword = sqliteTable("keyword", {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    active: integer("active", { mode: "boolean" }).default(true).notNull(),
}, (table) => [
    index("ix_keyword_name").on(table.name),
    index("ix_keyword_active").on(table.active),
    index("ix_keyword_user_id").on(table.userId),
]);


export const article = sqliteTable("article", {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    rssFeedId: integer("rss_feed_id").references(() => rssFeed.id),
    link: text().notNull(),
    title: text().notNull(),
    summary: text().notNull(),
    addedDate: text("added_date").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
}, (table) => [
    index("ix_article_rss_feed_id").on(table.rssFeedId),
]);


export const userRssFeed = sqliteTable("user_rss_feed", {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    rssFeedId: integer("rss_feed_id").notNull().references(() => rssFeed.id, { onDelete: "cascade" }),
}, (table) => [
    index("ix_user_rss_feed_user_id").on(table.userId),
    index("ix_user_rss_feed_rss_feed_id").on(table.rssFeedId),
]);


export const userArticle = sqliteTable("user_article", {
    id: integer().primaryKey({ autoIncrement: true }).notNull(),
    userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    articleId: integer("article_id").notNull().references(() => article.id, { onDelete: "cascade" }),
    isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
    isArchived: integer("is_archived", { mode: "boolean" }).default(false).notNull(),
    isDeleted: integer("is_deleted", { mode: "boolean" }).default(false).notNull(),
    markedAsReadDate: text("marked_as_read_date"),
    markedAsDeletedDate: text("marked_as_deleted_date"),
    markedAsArchivedDate: text("marked_as_archived_date"),
    addedDate: text("added_date").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});


export const userArticleKeyword = sqliteTable("user_article_keyword", {
    keywordId: integer("keyword_id").notNull().references(() => keyword.id, { onDelete: "cascade" }),
    userArticleId: integer("user_article_id").notNull().references(() => userArticle.id, { onDelete: "cascade" }),
});


export const userRelations = relations(user, ({ many }) => ({
    keywords: many(keyword),
    userRssFeeds: many(userRssFeed),
    userArticles: many(userArticle),
}));


export const keywordRelations = relations(keyword, ({ one, many }) => ({
    user: one(user, {
        fields: [keyword.userId],
        references: [user.id]
    }),
    userArticleKeywords: many(userArticleKeyword),
}));


export const articleRelations = relations(article, ({ one, many }) => ({
    rssFeed: one(rssFeed, {
        fields: [article.rssFeedId],
        references: [rssFeed.id]
    }),
    userArticles: many(userArticle),
}));


export const rssFeedRelations = relations(rssFeed, ({ many }) => ({
    articles: many(article),
    userRssFeeds: many(userRssFeed),
}));


export const userRssFeedRelations = relations(userRssFeed, ({ one }) => ({
    rssFeed: one(rssFeed, {
        fields: [userRssFeed.rssFeedId],
        references: [rssFeed.id]
    }),
    user: one(user, {
        fields: [userRssFeed.userId],
        references: [user.id]
    }),
}));


export const userArticleRelations = relations(userArticle, ({ one, many }) => ({
    article: one(article, {
        fields: [userArticle.articleId],
        references: [article.id]
    }),
    user: one(user, {
        fields: [userArticle.userId],
        references: [user.id]
    }),
    userArticleKeywords: many(userArticleKeyword),
}));


export const userArticleKeywordRelations = relations(userArticleKeyword, ({ one }) => ({
    keyword: one(keyword, {
        fields: [userArticleKeyword.keywordId],
        references: [keyword.id]
    }),
    userArticle: one(userArticle, {
        fields: [userArticleKeyword.userArticleId],
        references: [userArticle.id]
    }),
}));
