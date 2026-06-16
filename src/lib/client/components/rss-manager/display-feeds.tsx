import {toast} from "sonner";
import React, {useState} from "react";
import {Rss, Trash2} from "lucide-react";
import {UserRssFeed} from "@/lib/types/types";
import {Button} from "@/lib/client/components/ui/button";
import {useRemoveUserRssFeedMutation} from "@/lib/client/react-query/mutations";


export function DisplayFeeds({ userRssFeeds }: { userRssFeeds: UserRssFeed[] }) {
    const removeUserRssFeedMutation = useRemoveUserRssFeedMutation();
    const [removingFeedId, setRemovingFeedId] = useState<number | null>(null);

    const handleRemoveRssFeed = (rssFeed: UserRssFeed) => {
        if (removingFeedId !== null) return;

        setRemovingFeedId(rssFeed.id);
        removeUserRssFeedMutation.mutate({ data: { rssIds: [rssFeed.id] } }, {
            onError: () => {
                setRemovingFeedId(null);
                toast.error("Failed to remove this RSS Feed");
            },
            onSuccess: () => {
                setRemovingFeedId(null);
                toast.success("RSS Feed successfully removed");
            },
        });
    };

    const sortedRssFeeds = [...userRssFeeds].sort((a, b) => {
        const publisherComp = a.publisher.localeCompare(b.publisher);
        if (publisherComp !== 0) return publisherComp;
        return a.journal.localeCompare(b.journal);
    });

    const groupedRssFeeds = sortedRssFeeds.reduce<Record<string, UserRssFeed[]>>((acc, feed) => {
        const publisher = feed.publisher;
        if (!acc[publisher]) acc[publisher] = [];
        acc[publisher].push(feed);
        return acc;
    }, {});

    return (
        <div className="mt-6 space-y-4">
            {userRssFeeds.length === 0 &&
                <div className="rounded-lg border border-dashed border-[#343434] py-10 text-center text-sm text-[#9ba3af]">
                    No RSS feeds added yet.
                </div>
            }
            {Object.entries(groupedRssFeeds).map(([publisher, feeds]) => (
                <section key={publisher} className="rounded-lg border border-[#303030] bg-[#181818]">
                    <div className="flex items-center justify-between gap-3 border-b border-[#303030] px-4 py-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#f3f5f4]">
                                {publisher}
                            </h3>
                            <p className="text-xs text-[#9ba3af]">
                                {feeds.length} {feeds.length === 1 ? "feed" : "feeds"}
                            </p>
                        </div>
                    </div>
                    <div className="divide-y divide-[#282828]">
                        {feeds.map((feed) =>
                            <div key={feed.id} className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-[#202020]">
                                <div className="flex min-w-0 items-start gap-3">
                                    <div className="mt-0.5 rounded-md border border-[#353535] bg-[#222222] p-2 text-[#9ba3af]">
                                        <Rss className="size-4"/>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[#f3f5f4]" title={feed.journal}>
                                            {feed.journal}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-[#8f96a3]" title={feed.url}>
                                            {feed.url}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    title="Remove RSS Feed"
                                    disabled={removingFeedId !== null}
                                    className="size-8 shrink-0 text-[#9ca3af] hover:bg-[#332424] hover:text-[#f4d6d6]"
                                    onClick={() => handleRemoveRssFeed(feed)}
                                >
                                    {removingFeedId === feed.id
                                        ? <span className="size-4 animate-spin rounded-full border-2 border-[#9ca3af] border-t-transparent"/>
                                        : <Trash2 className="size-4"/>
                                    }
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            ))}
        </div>
    );
}
