import React from "react";
import {toast} from "sonner";
import {Trash} from "lucide-react";
import {queryKeys} from "@/lib/react-query";
import {Button} from "@/components/ui/button";
import {useIsMobile} from "@/hooks/use-mobile";
import {UserRssFeed} from "@/server/types/types";
import {MutedText} from "@/components/muted-text";
import {useQueryClient} from "@tanstack/react-query";


export function DisplayFeeds({ userRssFeeds }: { userRssFeeds: UserRssFeed[] }) {
    const isMobile = useIsMobile();
    const queryClient = useQueryClient();
    const { removeRssFeedMutation } = useSimpleMutations();

    const handleRemoveRssFeed = (rssFeed: UserRssFeed) => {
        removeRssFeedMutation.mutate({ rssIds: [rssFeed.id] }, {
            onError: () => toast.error("Failed to remove this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully removed");
                await queryClient.invalidateQueries({ queryKey: queryKeys.rssManagerKey() });
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