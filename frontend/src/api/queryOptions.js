import {api} from "@/api/apiClient";
import {fetcher} from "@/api/fetcher";
import {queryOptions} from "@tanstack/react-query";


export const authOptions = () => queryOptions({
    queryKey: ["currentUser"],
    queryFn: () => api.fetchCurrentUser(),
    staleTime: Infinity,
});


export const dashboardOptions = (search) => queryOptions({
    queryKey: ["dashboard", search],
    queryFn: () => fetcher({ url: "/dashboard", queryOrData: search }),
});


export const keywordsOptions = () => queryOptions({
    queryKey: ["keywords"],
    queryFn: () => fetcher({ url: "/user/keywords" }),
});


export const rssManagerOptions = () => queryOptions({
    queryKey: ["rssManager"],
    queryFn: () => fetcher({ url: "/user/rss_feeds" }),
});


export const rssSearchOptions = (query) => queryOptions({
    queryKey: ["rssSearch", query],
    queryFn: () => fetcher({ url: "/rss_feed/search", queryOrData: { q: query } }),
    staleTime: 1000 * 60 * 2,
    enabled: query.length >= 2,
});