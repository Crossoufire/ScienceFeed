import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {queryClient} from "@/api/queryClient";
import {Button} from "@/components/ui/button";
import {simpleMutations} from "@/api/mutations";
import {LuPlus, LuSave, LuX} from "react-icons/lu";
import {rssManagerOptions} from "@/api/queryOptions";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "@/components/app/base/PageTitle";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/rss-manager")({
    component: RssManager,
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(rssManagerOptions()),
});


function RssManager() {
    const [isOpen, setIsOpen] = useState(false);
    const rssData = useSuspenseQuery(rssManagerOptions()).data;

    const onOpenChange = () => {
        setIsOpen(!isOpen);
    };

    return (
        <PageTitle title="RSS Feeds Manager" subtitle="Manage your RSS feeds.">
            <FormAddRSSFeed
                open={isOpen}
                rssData={rssData}
                onOpenChange={onOpenChange}
            />
            <RssFeedGroups
                initialRSSData={rssData}
                onOpenChange={onOpenChange}
            />
        </PageTitle>
    );
}


function FormAddRSSFeed({ rssData, open, onOpenChange }) {
    const { addRssFeed } = simpleMutations();
    const allRSSFeeds = useMemo(() => rssData.rss_feeds.concat(rssData.user_rss_feeds), [rssData]);
    const form = useForm({ defaultValues: { publisher: "", journal: "", url: "" }, shouldFocusError: false });

    const onSubmit = (data) => {
        if (allRSSFeeds.some(feed => feed.url === data.url)) {
            form.setError("url", {
                type: "manual",
                message: "This URL already exists in the database."
            });
            return;
        }

        const existingSetting = allRSSFeeds.find(feed => feed.publisher === data.publisher && feed.journal === data.journal);
        if (existingSetting && existingSetting.url !== data.url) {
            if (!confirm("This publisher and journal combination already exists with a different URL." +
                "Do you still want to add this RSS Feed?")) return;
        }

        addRssFeed.mutate({ publisher: data.publisher, journal: data.journal, url: data.url }, {
            onError: () => toast.error("Failed to add the new RSS Feed"),
            onSuccess: async () => {
                toast.success("RSS Feed added successfully");
                await queryClient.invalidateQueries({ queryKey: ["rssManager"] });
                onOpenChange();
            },
            onSettled: () => form.reset(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="space-y-4 mt-6 mb-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6 mb-8">
                        <FormField
                            control={form.control}
                            name="publisher"
                            rules={{ required: "Please enter a publisher" }}
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel>Publisher</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <FormField
                            control={form.control}
                            name="journal"
                            rules={{ required: "Please enter a journal" }}
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel>Journal</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <FormField
                            control={form.control}
                            name="url"
                            rules={{ required: "Please enter a url" }}
                            render={({ field }) =>
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <Button type="submit" disabled={addRssFeed.isPending}>
                            Add RSS Feed
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


function RssFeedGroups({ initialRSSData, onOpenChange }) {
    const { saveRssFeeds } = simpleMutations();
    const [userSearch, setUserSearch] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [globalSearch, setGlobalSearch] = useState("");
    const [globalFeeds, setGlobalFeeds] = useState(initialRSSData.rss_feeds);
    const [userFeeds, setUserFeeds] = useState(initialRSSData.user_rss_feeds);

    useEffect(() => {
        const filteredGlobalFeeds = initialRSSData.rss_feeds.filter(
            globalFeed => !initialRSSData.user_rss_feeds.some(userFeed => userFeed.id === globalFeed.id)
        );
        setGlobalFeeds(filteredGlobalFeeds);
        setUserFeeds(initialRSSData.user_rss_feeds);
    }, [initialRSSData]);

    const handleAddFeed = useCallback((feed) => {
        setHasChanges(true);
        setGlobalFeeds(prev => prev.filter(f => f.id !== feed.id));
        setUserFeeds(prev => [...prev, feed]);
    }, []);

    const handleRemoveFeed = useCallback((feed) => {
        setHasChanges(true);
        setUserFeeds(prev => prev.filter(f => f.id !== feed.id));
        setGlobalFeeds(prev => [...prev, feed]);
    }, []);

    const saveChanges = () => {
        const rssFeedsIds = userFeeds.map(feed => feed.id);

        saveRssFeeds.mutate({ rssFeedsIds }, {
            onError: () => toast.error("Failed to save the changes"),
            onSuccess: () => toast.success("Changes saved successfully"),
            onSettled: () => setHasChanges(false),
        });
    };

    const filteredGlobalFeeds = globalFeeds.filter(feed =>
        feed.publisher.toLowerCase().includes(globalSearch.toLowerCase()) ||
        feed.journal.toLowerCase().includes(globalSearch.toLowerCase())
    );

    const filteredUserFeeds = userFeeds.filter(feed =>
        feed.publisher.toLowerCase().includes(userSearch.toLowerCase()) ||
        feed.journal.toLowerCase().includes(userSearch.toLowerCase())
    );

    return (
        <>
            <div className="flex items-center justify-end gap-3">
                <Button onClick={() => onOpenChange()} className="flex items-center gap-2">
                    <LuPlus className="h-4 w-4"/> Add RSS Feed
                </Button>
                <Button onClick={saveChanges} disabled={!hasChanges || saveRssFeeds.isPending} className="flex items-center gap-2">
                    <LuSave className="h-4 w-4"/> Save Changes
                </Button>
            </div>
            <div className="grid grid-cols-2 gap-8">
                <div className="mt-5">
                    <h3 className="text-lg font-semibold mb-4">Global RSS Feeds</h3>
                    <Input
                        value={globalSearch}
                        className="mb-4 w-[250px]"
                        placeholder="Search global feeds..."
                        onChange={(ev) => setGlobalSearch(ev.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        {filteredGlobalFeeds.map(feed =>
                            <div key={feed.id} className="py-2 px-4 border border-neutral-700 rounded-md flex justify-between
                        items-center hover:bg-secondary/50 transition-colors">
                                <div>
                                    <p><strong>Publisher:</strong> {feed.publisher}</p>
                                    <p><strong>Journal:</strong> {feed.journal}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleAddFeed(feed)}>
                                    <LuPlus className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-5">
                    <h3 className="text-lg font-semibold mb-4">My RSS Feeds</h3>
                    <Input
                        value={userSearch}
                        className="mb-4 w-[250px]"
                        placeholder="Search my feeds..."
                        onChange={(ev) => setUserSearch(ev.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        {filteredUserFeeds.map(feed =>
                            <div key={feed.id} className="flex items-center justify-between bg-secondary py-2 px-4 rounded-md">
                                <div>
                                    <p><strong>Publisher:</strong> {feed.publisher}</p>
                                    <p><strong>Journal:</strong> {feed.journal}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveFeed(feed)}>
                                    <LuX className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}