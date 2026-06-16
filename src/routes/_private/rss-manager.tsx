import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {rssManagerOptions} from "@/lib/client/react-query";
import {PageTitle} from "@/lib/client/components/page-title";
import {DisplayFeeds} from "@/lib/client/components/rss-manager/display-feeds";
import {SearchRSSFeeds} from "@/lib/client/components/rss-manager/search-feeds";
import {CreateNewRSSFeed} from "@/lib/client/components/rss-manager/create-feed";


export const Route = createFileRoute("/_private/rss-manager")({
    loader: ({ context: { queryClient } }) => {
        return queryClient.ensureQueryData(rssManagerOptions);
    },
    component: RssManager,
});


function RssManager() {
    const userRssFeeds = useSuspenseQuery(rssManagerOptions).data;
    const publisherCount = new Set(userRssFeeds.map((feed) => feed.publisher)).size;

    return (
        <PageTitle title="RSS Feeds Manager" subtitle="Search and Manage your RSS feeds.">
            <div className="mt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <SearchRSSFeeds/>
                    <CreateNewRSSFeed/>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#9ba3af]">
                    <span className="rounded-full border border-[#353535] bg-[#222222] px-2.5 py-1">
                        {userRssFeeds.length} feeds
                    </span>
                    <span className="rounded-full border border-[#353535] bg-[#222222] px-2.5 py-1">
                        {publisherCount} publishers
                    </span>
                </div>
            </div>
            <DisplayFeeds
                userRssFeeds={userRssFeeds}
            />
        </PageTitle>
    );
}
