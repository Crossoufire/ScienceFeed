import {toast} from "sonner";
import {useRef, useState} from "react";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {queryClient} from "@/api/queryClient";
import {Button} from "@/components/ui/button";
import {useIsMobile} from "@/hooks/use-mobile";
import {useSimpleMutations} from "@/api/mutations";
import {useDebounce} from "@/hooks/DebounceHook";
import {Separator} from "@/components/ui/separator";
import {PageTitle} from "@/components/app/PageTitle";
import {MutedText} from "@/components/app/MutedText";
import {createFileRoute} from "@tanstack/react-router";
import {useOnClickOutside} from "@/hooks/ClickedOutsideHook";
import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
import {CheckCircle, Loader2, Plus, Search, Trash} from "lucide-react";
import {rssManagerOptions, rssSearchOptions} from "@/api/queryOptions";
import {Command, CommandEmpty, CommandItem, CommandList} from "@/components/ui/command";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/rss-manager")({
    component: RssManager,
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(rssManagerOptions()),
});


function RssManager() {
    const userRssFeeds = useSuspenseQuery(rssManagerOptions()).data;

    return (
        <PageTitle title="RSS Feeds Manager" subtitle="Search and Manage your RSS feeds.">
            <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
                <SearchRSSFeeds userRssFeeds={userRssFeeds}/>
                <CreateNewRSSFeed/>
            </div>
            <UserRssFeeds userRssFeeds={userRssFeeds}/>
        </PageTitle>
    );
}


function SearchRSSFeeds() {
    const commandRef = useRef(null);
    const { addRssFeeds } = useSimpleMutations();
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


function CreateNewRSSFeed() {
    const { createRssFeed } = useSimpleMutations();
    const [open, setOpen] = useState(false);
    const form = useForm({ defaultValues: { url: "", journal: "", publisher: "" } });

    const onSubmit = (data) => {
        createRssFeed.mutate({ url: data.url, journal: data.journal, publisher: data.publisher }, {
            onError: (error) => toast.error(error?.description ?? "Failed to add this RSS Feed"),
            onSuccess: async () => {
                form.reset();
                setOpen(false);
                toast.success("RSS Feed successfully added");
                await queryClient.invalidateQueries({ queryKey: ["rssManager"] });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="w-4 h-4 mr-2"/> Add New RSS Feed
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950">
                <DialogHeader>
                    <DialogTitle>Add RSS Feed</DialogTitle>
                    <DialogDescription>Add a new RSS feed to your account.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="http://feeds.rsc.org/rss/cp" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <FormField
                            control={form.control}
                            name="journal"
                            rules={{ required: { value: true, message: "Journal name cannot be empty" } }}
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel>Journal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Journal Name" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <FormField
                            control={form.control}
                            name="publisher"
                            rules={{ required: { value: true, message: "Publisher name cannot be empty" } }}
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel>Publisher</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Publisher Name" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <Button type="submit" disabled={createRssFeed.isPending || !form.formState.isDirty || !form.formState.isValid}>
                            {createRssFeed.isPending ? "Adding..." : "Add RSS Feed"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
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
                        {rssFeed.is_active && <CheckCircle className="w-4 h-4 ml-2 text-green-500 flex-shrink-0"/>}
                    </div>
                </div>
            </CommandItem>
            <Separator className="my-1"/>
        </div>
    );
}


function UserRssFeeds({ userRssFeeds }) {
    const isMobile = useIsMobile();
    const { removeRssFeed } = useSimpleMutations();

    const handleRemoveRssFeed = (rssFeed) => {
        removeRssFeed.mutate({ rssIds: [rssFeed.id] }, {
            onError: () => toast.error("Failed to remove this RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed successfully removed");
                await queryClient.invalidateQueries({ queryKey: ["rssManager"] });
            },
        });
    };

    const sortedRssFeeds = [...userRssFeeds].sort((a, b) => {
        const publisherComp = a.publisher.localeCompare(b.publisher);
        if (publisherComp !== 0) {
            return publisherComp;
        }
        return a.journal.localeCompare(b.journal);
    });

    const groupedRssFeeds = sortedRssFeeds.reduce((acc, feed) => {
        const publisher = feed.publisher;
        if (!acc[publisher]) {
            acc[publisher] = [];
        }
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
                        {feeds.map((feed) => (
                            <div key={feed.id} className="flex items-center justify-between bg-secondary py-2 px-4 rounded-md">
                                <div>
                                    <p className="font-medium">{feed.journal}</p>
                                    {!isMobile && <MutedText>{feed.url}</MutedText>}
                                </div>
                                <Button size="icon" variant="ghost" title="Remove RSS Feed" onClick={() => handleRemoveRssFeed(feed)}>
                                    <Trash className="h-4 w-4"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
