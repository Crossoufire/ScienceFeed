import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import React, {useRef, useState} from "react";
import {useDebounce} from "@/hooks/use-debounce";
import {UserRssFeed} from "@/server/types/types";
import {Separator} from "@/components/ui/separator";
import {CheckCircle, Loader2, Search} from "lucide-react";
import {useOnClickOutside} from "@/hooks/use-clicked-outside";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Command, CommandEmpty, CommandItem, CommandList} from "@/components/ui/command";


export function SearchRSSFeeds() {
    const queryClient = useQueryClient();
    const commandRef = useRef(null);
    const [search, setSearch] = useState("");
    const { addRssFeedsMutation } = useSimpleMutations();
    const [isOpen, setIsOpen] = useState(false);
    const [debouncedSearch] = useDebounce(search, 350);
    const { data, isLoading, error } = useQuery(rssSearchOptions(debouncedSearch));

    const handleAddRssFeed = (rssFeed: UserRssFeed) => {
        if (rssFeed.isActive) return;

        addRssFeedsMutation.mutate({ data: { rssFeedsIds: [rssFeed.id] } }, {
            onError: () => toast.error("Failed to add this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully added");
                await queryClient.invalidateQueries({ queryKey: ["rssManager"] });
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
                                data.map(rssFeed =>
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
    rssFeed: UserRssFeed;
    handleAddRssFeed: (rssFeed: UserRssFeed) => void;
}


function SearchComponent({ rssFeed, handleAddRssFeed }: SearchComponentProps) {
    return (
        <div role="button" onClick={() => handleAddRssFeed(rssFeed)}>
            <CommandItem key={rssFeed.id} className="cursor-pointer py-2" disabled={rssFeed.isActive}>
                <div className="grid grid-cols-[50px,auto,1fr] gap-2 items-center w-full">
                    <div className="font-semibold truncate" title={rssFeed.publisher}>
                        {rssFeed.publisher}
                    </div>
                    <div className="text-neutral-600">|</div>
                    <div className="flex items-center">
                        <span className="truncate">{rssFeed.journal}</span>
                        {rssFeed.isActive && <CheckCircle className="w-4 h-4 ml-2 text-green-500 flex-shrink-0"/>}
                    </div>
                </div>
            </CommandItem>
            <Separator className="my-1"/>
        </div>
    );
}
