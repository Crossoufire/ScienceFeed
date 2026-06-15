import React from "react";
import {toast} from "sonner";
import {Trash} from "lucide-react";
import {UserRssFeed} from "@/lib/types/types";
import {useQueryClient} from "@tanstack/react-query";
import {Button} from "@/lib/client/components/ui/button";
import {rssManagerOptions} from "@/lib/client/react-query";
import {MutedText} from "@/lib/client/components/muted-text";
import {useBreakpoint} from "@/lib/client/hooks/use-breakpoint";
import {useRemoveUserRssFeedMutation} from "@/lib/client/react-query/mutations";


export function DisplayFeeds({ userRssFeeds }: { userRssFeeds: UserRssFeed[] }) {
    const queryClient = useQueryClient();
    const isMobile = useBreakpoint("sm");
    const removeUserRssFeedMutation = useRemoveUserRssFeedMutation();

    const handleRemoveRssFeed = (rssFeed: UserRssFeed) => {
        removeUserRssFeedMutation.mutate({ data: { rssIds: [rssFeed.id] } }, {
            onError: () => toast.error("Failed to remove this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully removed");
                await queryClient.invalidateQueries({ queryKey: rssManagerOptions.queryKey });
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
        <div>
            {Object.entries(groupedRssFeeds).map(([publisher, feeds]) => (
                <div key={publisher}>
                    <h3 className="text-lg font-semibold mb-2 mt-4">
                        {publisher}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                        {feeds.map((feed) =>
                            <div key={feed.id} className="flex items-center justify-between bg-secondary py-2 px-4 rounded-md">
                                <div>
                                    <p className="font-medium">{feed.journal}</p>
                                    {!isMobile && <MutedText>{feed.url}</MutedText>}
                                </div>
                                <Button size="icon" variant="ghost" title="Remove RSS Feed" onClick={() => handleRemoveRssFeed(feed)}>
                                    <Trash className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}