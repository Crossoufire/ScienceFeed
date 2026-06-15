import {toast} from "sonner";
import React, {useRef, useState} from "react";
import {SearchRssFeed} from "@/lib/types/types";
import {Input} from "@/lib/client/components/ui/input";
import {CheckCircle, Loader2, Search} from "lucide-react";
import {useDebounce} from "@/lib/client/hooks/use-debounce";
import {Separator} from "@/lib/client/components/ui/separator";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useOnClickOutside} from "@/lib/client/hooks/use-clicked-outside";
import {rssManagerOptions, rssSearchOptions} from "@/lib/client/react-query";
import {useAddRssFeedsToUserMutation} from "@/lib/client/react-query/mutations";
import {Command, CommandEmpty, CommandItem, CommandList} from "@/lib/client/components/ui/command";


export function SearchRSSFeeds() {
    const queryClient = useQueryClient();
    const commandRef = useRef(null);
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(search, 350);
    const addRssFeedsMutation = useAddRssFeedsToUserMutation();
    const { data, isLoading, error } = useQuery(rssSearchOptions(debouncedQuery));

    const handleAddRssFeed = (rssFeed: SearchRssFeed) => {
        if (rssFeed.isActive) return;

        addRssFeedsMutation.mutate({ data: { feedsIds: [rssFeed.id] } }, {
            onError: () => toast.error("Failed to add this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully added");
                await queryClient.invalidateQueries({ queryKey: rssManagerOptions.queryKey });
            },
        });
    };

    const handleInputChange = (ev: any) => {
        setIsOpen(true);
        setSearch(ev.target.value);
    };

    const resetSearch = () => {
        setSearch("");
        setIsOpen(false);
    };

    useOnClickOutside(commandRef, resetSearch);

    return (
        <div ref={commandRef}>
            <div className="relative">
                <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <Input
                    value={search}
                    className="w-87.5 pl-8"
                    onChange={handleInputChange}
                    placeholder="Search RSS feeds..."
                />
            </div>
            {isOpen && (debouncedQuery.length >= 2 || isLoading) &&
                <div className="z-50 absolute w-125 rounded-lg border shadow-md mt-1">
                    <Command>
                        <CommandList className="max-h-87.5 overflow-y-auto">
                            {isLoading &&
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin"/>
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
    rssFeed: SearchRssFeed;
    handleAddRssFeed: (rssFeed: SearchRssFeed) => void;
}


function SearchComponent({ rssFeed, handleAddRssFeed }: SearchComponentProps) {
    return (
        <div role="button" onClick={() => handleAddRssFeed(rssFeed)}>
            <CommandItem key={rssFeed.id} className="cursor-pointer py-2" disabled={rssFeed.isActive}>
                <div className="grid grid-cols-[50px_auto_1fr] gap-2 items-center w-full">
                    <div className="font-semibold truncate" title={rssFeed.publisher}>
                        {rssFeed.publisher}
                    </div>
                    <div className="text-neutral-600">|</div>
                    <div className="flex items-center">
                        <span className="truncate">{rssFeed.journal}</span>
                        {rssFeed.isActive && <CheckCircle className="w-4 h-4 ml-2 text-green-500 shrink-0"/>}
                    </div>
                </div>
            </CommandItem>
            <Separator className="my-1"/>
        </div>
    );
}
