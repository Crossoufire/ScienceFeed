import {queryOptions} from "@tanstack/react-query";
import {getCurrentUser} from "@/server/functions/auth";
import {UserArticlesSearch} from "@/server/types/types";
import {getUserKeywords} from "@/server/functions/keywords";
import {getUserArticles} from "@/server/functions/articles";
import {getUserRssFeeds, rssFeedSearch} from "@/server/functions/rss-feeds";


export const queryKeys = {
    authKey: () => ["currentUser"] as const,
    userKeywordsKey: () => ["keywords"] as const,
    rssManagerKey: () => ["rssManager"] as const,
    rssSearchKey: (query: string) => ["rssSearch", query] as const,
    userArticlesKey: (search: UserArticlesSearch) => ["userArticles", search] as const,
    userArchivedKey: (search: UserArticlesSearch) => ["userArchived", search] as const,
    userDeletedKey: (search: UserArticlesSearch) => ["userDeleted", search] as const,
};


export const authOptions = () => queryOptions({
    queryKey: queryKeys.authKey(),
    queryFn: () => getCurrentUser(),
    staleTime: 60 * 1000,
});


export const userArticlesOptions = (search: UserArticlesSearch) => queryOptions({
    queryKey: queryKeys.userArticlesKey(search),
    queryFn: () => getUserArticles({ data: search }),
});


export const userArchivedOptions = (search: UserArticlesSearch) => queryOptions({
    queryKey: queryKeys.userArchivedKey(search),
    queryFn: () => ({}),
});


export const userDeletedOptions = (search: UserArticlesSearch) => queryOptions({
    queryKey: queryKeys.userDeletedKey(search),
    queryFn: () => ({}),
});


export const userKeywordsOptions = () => queryOptions({
    queryKey: queryKeys.userKeywordsKey(),
    queryFn: () => getUserKeywords(),
});


export const rssManagerOptions = () => queryOptions({
    queryKey: queryKeys.rssManagerKey(),
    queryFn: () => getUserRssFeeds(),
});


export const rssSearchOptions = (query: string) => queryOptions({
    queryKey: queryKeys.rssSearchKey(query),
    queryFn: () => rssFeedSearch({ data: query }),
    staleTime: 2 * 60 * 1000,
    enabled: query.length >= 2,
});
