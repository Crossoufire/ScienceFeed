import z from "zod";
import {authOptions, rssManagerOptions, rssSearchOptions, userArticlesOptions, userKeywordsOptions} from "@/lib/react-query";


export type CurrentUser = ReturnType<typeof authOptions>["queryFn"];
export type UserKeyword = Awaited<ReturnType<NonNullable<ReturnType<typeof userKeywordsOptions>["queryFn"]>>>[0];

export type UserRssFeeds = Awaited<ReturnType<NonNullable<ReturnType<typeof rssManagerOptions>["queryFn"]>>>;
export type UserRssFeed = UserRssFeeds[0];

export type SearchRssFeeds = Awaited<ReturnType<NonNullable<ReturnType<typeof rssSearchOptions>["queryFn"]>>>;
export type SearchRssFeed = SearchRssFeeds[0];

export type ArticleBulkActions = "select" | "deselect" | "unread" | "archive" | "delete";
export type DashboardArticles = Awaited<ReturnType<NonNullable<ReturnType<typeof userArticlesOptions>["queryFn"]>>>;
export type UserArticles = DashboardArticles["articles"];
export type UserArticle = UserArticles[0];


export const generalSettingsSchema = z.object({
    name: z.string(),
    sendFeedEmails: z.boolean(),
    maxArticlesPerEmail: z.number(),
});


export const createRssFeedSchema = z.object({
    url: z.string(),
    journal: z.string(),
    publisher: z.string(),
});


export const userArticlesSearchSchema = z.object({
    page: z.number().positive().optional().catch(1),
    search: z.string().optional().catch(""),
    keywordsIds: z.array(z.number().positive()).optional().catch([]),
})


export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type CreateRssFeed = z.infer<typeof createRssFeedSchema>;
export type UserArticlesSearch = z.infer<typeof userArticlesSearchSchema>;