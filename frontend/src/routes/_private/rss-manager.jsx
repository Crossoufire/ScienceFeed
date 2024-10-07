import {toast} from "sonner";
import {useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {queryClient} from "@/api/queryClient";
import {Button} from "@/components/ui/button";
import {simpleMutations} from "@/api/mutations";
import {useDebounce} from "@/hooks/DebounceHook";
import {Separator} from "@/components/ui/separator";
import {PageTitle} from "@/components/app/PageTitle";
import {createFileRoute} from "@tanstack/react-router";
import {useOnClickOutside} from "@/hooks/ClickedOutsideHook";
import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {LuCheckCircle, LuLoader2, LuSearch, LuX} from "react-icons/lu";
import {rssManagerOptions, rssSearchOptions} from "@/api/queryOptions";
import {Command, CommandEmpty, CommandItem, CommandList} from "@/components/ui/command";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/rss-manager")({
    component: RssManager,
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(rssManagerOptions()),
});


function RssManager() {
    const userRssFeeds = useSuspenseQuery(rssManagerOptions()).data;

    return (
        <PageTitle title="RSS Feeds Manager" subtitle="Search and Manage your RSS feeds.">
            <SearchRSSFeeds userRssFeeds={userRssFeeds}/>
            <UserRssFeeds userRssFeeds={userRssFeeds}/>
        </PageTitle>
    );
}


function SearchRSSFeeds() {
    const commandRef = useRef(null);
    const { addRssFeeds } = simpleMutations();
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [debouncedSearch] = useDebounce(search, 350);
    const { data, isLoading, error } = useQuery(rssSearchOptions(debouncedSearch));

    const handleAddRssFeed = (rssFeed) => {
        if (rssFeed.is_active) return;

        addRssFeeds.mutate({ rssFeedsIds: [rssFeed.id] }, {
            onError: () => toast.error("Failed to add this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully added");
                await queryClient.invalidateQueries({ queryKey: ["rssManager"] });
            },
        });
    };

    const handleInputChange = (ev) => {
        setIsOpen(true);
        setSearch(ev.target.value);
    };

    const resetSearch = () => {
        setSearch("");
        setIsOpen(false);
    };

    useOnClickOutside(commandRef, resetSearch);

    return (
        <div ref={commandRef} className="mt-6">
            <div className="relative">
                <LuSearch size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    value={search}
                    className="w-[350px] pl-8"
                    onChange={handleInputChange}
                    placeholder="Search RSS feeds..."
                />
            </div>
            {isOpen && (debouncedSearch.length >= 2 || isLoading) &&
                <div className="z-50 absolute w-[500px] rounded-lg border shadow-md mt-1">
                    <Command>
                        <CommandList className="max-h-[350px] overflow-y-auto">
                            {isLoading &&
                                <div className="flex items-center justify-center p-4">
                                    <LuLoader2 className="h-6 w-6 animate-spin"/>
                                </div>
                            }
                            {error && (
                                error.status === 429 ?
                                    <CommandEmpty>Too many requests. Please wait a bit and try again.</CommandEmpty>
                                    :
                                    <CommandEmpty>An error occurred. Please try again.</CommandEmpty>
                            )}
                            {data && data.length === 0 &&
                                <CommandEmpty>No results found.</CommandEmpty>
                            }
                            {data && data.length > 0 &&
                                data.map(rssFeed =>
                                    <SearchComponent
                                        rssFeed={rssFeed}
                                        handleAddRssFeed={handleAddRssFeed}
                                    />
                                )}
                        </CommandList>
                    </Command>
                </div>
            }
        </div>
    );
}


function SearchComponent({ rssFeed, handleAddRssFeed }) {
    return (
        <div role="button" onClick={() => handleAddRssFeed(rssFeed)}>
            <CommandItem key={rssFeed.id} className="cursor-pointer py-2" disabled={rssFeed.is_active}>
                <div className="grid grid-cols-[50px,auto,1fr] gap-2 items-center w-full">
                    <div className="font-semibold truncate" title={rssFeed.publisher}>
                        {rssFeed.publisher}
                    </div>
                    <div className="text-neutral-600">|</div>
                    <div className="flex items-center">
                        <span className="truncate">{rssFeed.journal}</span>
                        {rssFeed.is_active && <LuCheckCircle className="ml-2 text-green-500 flex-shrink-0"/>}
                    </div>
                </div>
            </CommandItem>
            <Separator className="my-1"/>
        </div>
    );
}


function UserRssFeeds({ userRssFeeds }) {
    const { removeRssFeed } = simpleMutations();

    const handleRemoveRssFeed = (rssFeed) => {
        removeRssFeed.mutate({ rssIds: [rssFeed.id] }, {
            onError: () => toast.error("Failed to remove this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully removed");
                await queryClient.invalidateQueries({ queryKey: ["rssManager"] });
            },
        });
    };

    return (
        <div className="mt-5">
            <h3 className="text-lg font-semibold mb-4">My RSS Feeds</h3>
            <div className="grid grid-cols-2 gap-3">
                {userRssFeeds.map(feed =>
                    <div key={feed.id} className="flex items-center justify-between bg-secondary py-2 px-4 rounded-md">
                        <div>
                            <p><strong>Publisher:</strong> {feed.publisher}</p>
                            <p><strong>Journal:</strong> {feed.journal}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveRssFeed(feed)}>
                            <LuX className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
