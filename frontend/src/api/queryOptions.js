import {fetcher} from "@/api/fetcher";
import {queryOptions} from "@tanstack/react-query";


export const dashboardOptions = () => queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => fetcher({ url: "/dashboard" }),
});


export const keywordsOptions = () => queryOptions({
    queryKey: ["keywords"],
    queryFn: () => fetcher({ url: "/keywords" }),
});


export const rssManagerOptions = () => queryOptions({
    queryKey: ["rssManager"],
    queryFn: () => fetcher({ url: "/rss_feeds" }),
});
