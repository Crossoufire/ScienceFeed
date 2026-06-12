import React from "react";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {rssManagerOptions} from "@/lib/client/react-query";
import {PageTitle} from "@/lib/client/components/page-title";
import {DisplayFeeds} from "@/lib/client/components/rss-manager/display-feeds";
import {SearchRSSFeeds} from "@/lib/client/components/rss-manager/search-feeds";
import {CreateNewRSSFeed} from "@/lib/client/components/rss-manager/create-feed";


export const Route = createFileRoute("/_private/rss-manager")({
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(rssManagerOptions()),
    component: RssManager,
});


function RssManager() {
    const userRssFeeds = useSuspenseQuery(rssManagerOptions()).data;

    return (
        <PageTitle title="RSS Feeds Manager" subtitle="Search and Manage your RSS feeds.">
            <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
                <SearchRSSFeeds/>
                <CreateNewRSSFeed/>
            </div>
            <DisplayFeeds
                userRssFeeds={userRssFeeds}
            />
        </PageTitle>
    );
}
