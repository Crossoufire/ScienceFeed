import {toast} from "sonner";
import React, {useRef, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {SearchRssFeed} from "@/lib/types/types";
import {Input} from "@/lib/client/components/ui/input";
import {rssSearchOptions} from "@/lib/client/react-query";
import {useDebounce} from "@/lib/client/hooks/use-debounce";
import {CheckCircle, Loader2, Plus, Search} from "lucide-react";
import {useOnClickOutside} from "@/lib/client/hooks/use-clicked-outside";
import {useAddRssFeedsToUserMutation} from "@/lib/client/react-query/mutations";
import {Command, CommandEmpty, CommandItem, CommandList} from "@/lib/client/components/ui/command";


export function SearchRSSFeeds() {
    const commandRef = useRef(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(search, 350);
    const addRssFeedsMutation = useAddRssFeedsToUserMutation();
    const { data, isLoading, error } = useQuery(rssSearchOptions(debouncedQuery));
    const [pendingFeedId, setPendingFeedId] = useState<number | null>(null);

    const handleAddRssFeed = (rssFeed: SearchRssFeed) => {
        if (rssFeed.isActive || pendingFeedId !== null) return;

        setPendingFeedId(rssFeed.id);
        addRssFeedsMutation.mutate({ data: { feedsIds: [rssFeed.id] } }, {
            onError: () => {
                setPendingFeedId(null);
                toast.error("Failed to add this RSS Feed");
            },
            onSuccess: () => {
                setPendingFeedId(null);
                toast.success("RSS Feed successfully added");
            },
        });
    };

    const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setIsOpen(true);
        setSearch(ev.target.value);
    };

    const resetSearch = () => {
        setSearch("");
        setIsOpen(false);
    };

    useOnClickOutside(commandRef, resetSearch);

    return (
        <div ref={commandRef} className="relative w-full max-w-xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8f96a3]"/>
                <Input
                    value={search}
                    onChange={handleInputChange}
                    placeholder="Search RSS feeds..."
                    onFocus={() => setIsOpen(true)}
                    className="h-10 w-full border-[#343434] bg-[#202020] pl-9 text-sm"
                />
            </div>
            {isOpen && (debouncedQuery.length >= 2 || isLoading) &&
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-[#333333] bg-[#1b1b1b] shadow-xl">
                    <Command className="bg-[#1b1b1b]">
                        <CommandList className="max-h-90 overflow-y-auto p-1">
                            {isLoading &&
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="size-5 animate-spin text-[#9ba3af]"/>
                                </div>
                            }
                            {error && (
                                error.message === "429" ?
                                    <CommandEmpty>Too many requests. Please wait a bit and try again.</CommandEmpty>
                                    :
                                    <CommandEmpty>An error occurred. Please try again.</CommandEmpty>
                            )}
                            {data && data.length === 0 &&
                                <CommandEmpty>No results found.</CommandEmpty>
                            }
                            {data && data.length > 0 &&
                                data.map((rssFeed) =>
                                    <SearchComponent
                                        key={rssFeed.id}
                                        rssFeed={rssFeed}
                                        isPending={pendingFeedId === rssFeed.id}
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


interface SearchComponentProps {
    isPending: boolean;
    rssFeed: SearchRssFeed;
    handleAddRssFeed: (rssFeed: SearchRssFeed) => void;
}


function SearchComponent({ rssFeed, isPending, handleAddRssFeed }: SearchComponentProps) {
    const isDisabled = rssFeed.isActive || isPending;

    return (
        <CommandItem
            disabled={isDisabled}
            onSelect={() => handleAddRssFeed(rssFeed)}
            value={`${rssFeed.publisher} ${rssFeed.journal}`}
            className="cursor-pointer rounded-md px-3 py-2 data-[selected=true]:bg-[#262626]"
        >
            <div className="flex w-full min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-[#9ba3af]">
                        <span className="truncate font-medium" title={rssFeed.publisher}>
                            {rssFeed.publisher}
                        </span>
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium text-[#f3f5f4]" title={rssFeed.journal}>
                        {rssFeed.journal}
                    </div>
                </div>
                <div className="shrink-0">
                    {isPending
                        ? <Loader2 className="size-4 animate-spin text-[#9ba3af]"/>
                        : rssFeed.isActive
                            ? <CheckCircle className="size-4 text-[#9ca3af]"/>
                            : <Plus className="size-4 text-[#9ca3af]"/>
                    }
                </div>
            </div>
        </CommandItem>
    );
}
