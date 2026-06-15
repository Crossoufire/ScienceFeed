import {rssManagerOptions, rssSearchOptions, userArticlesOptions, userKeywordsOptions} from "@/lib/client/react-query";


export type ArticleBulkActions = "select" | "deselect" | "unread" | "archive" | "delete";


export type UserRssFeeds = Awaited<ReturnType<NonNullable<typeof rssManagerOptions.queryFn>>>;
export type UserKeyword = Awaited<ReturnType<NonNullable<typeof userKeywordsOptions.queryFn>>>[number];
export type SearchRssFeeds = Awaited<ReturnType<NonNullable<ReturnType<typeof rssSearchOptions>["queryFn"]>>>;
export type DashboardArticles = Awaited<ReturnType<NonNullable<ReturnType<typeof userArticlesOptions>["queryFn"]>>>;

export type UserRssFeed = UserRssFeeds[0];
export type UserArticle = UserArticles[0];
export type SearchRssFeed = SearchRssFeeds[0];
export type UserArticles = DashboardArticles["articles"];
