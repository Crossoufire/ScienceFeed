import {queryOptions} from "@tanstack/react-query";
import {getCurrentUser} from "@/server/functions/auth";
import {getUserRssFeeds} from "@/server/functions/rss-feeds";
import {getUserKeywords} from "@/server/functions/keywords";


export const queryKeys = {
    authKey: () => ["currentUser"] as const,
    userKeywordsKey: () => ["keywords"] as const,
    rssManagerKey: () => ["rssManager"] as const,
};


export const authOptions = () => queryOptions({
    queryKey: queryKeys.authKey(),
    queryFn: () => getCurrentUser(),
    staleTime: 60 * 1000,
});


export const userKeywordsOptions = () => queryOptions({
    queryKey: queryKeys.userKeywordsKey(),
    queryFn: () => getUserKeywords(),
});


export const rssManagerOptions = () => queryOptions({
    queryKey: queryKeys.rssManagerKey(),
    queryFn: () => getUserRssFeeds(),
});