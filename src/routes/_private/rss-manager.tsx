import React from "react";
import {PageTitle} from "@/components/page-title";
import {rssManagerOptions} from "@/lib/react-query";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {DisplayFeeds} from "@/components/rss-manager/display-feeds";
import {SearchRSSFeeds} from "@/components/rss-manager/search-feeds";
import {CreateNewRSSFeed} from "@/components/rss-manager/create-feed";


export const Route = createFileRoute("/_private/rss-manager")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(rssManagerOptions()),
    component: RssManager,
});


function RssManager() {
    const userRssFeeds = useSuspenseQuery(rssManagerOptions()).data;

    return (
        <PageTitle title="RSS Feeds Manager" subtitle="Search and Manage your RSS feeds.">
            <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
                <SearchRSSFeeds userRssFeeds={userRssFeeds}/>
                <CreateNewRSSFeed/>
            </div>
            <DisplayFeeds userRssFeeds={userRssFeeds}/>
        </PageTitle>
    );
}


