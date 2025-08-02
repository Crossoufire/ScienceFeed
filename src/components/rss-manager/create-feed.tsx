import {toast} from "sonner";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {Loader2, Plus} from "lucide-react";
import {Input} from "@/components/ui/input";
import {queryKeys} from "@/lib/react-query";
import {Button} from "@/components/ui/button";
import {useQueryClient} from "@tanstack/react-query";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";


interface FormValues {
    url: string;
    journal: string;
    publisher: string;
}


export function CreateNewRSSFeed() {
    const queryClient = useQueryClient();
    const { createRssFeedMutation } = useSimpleMutations();
    const [open, setOpen] = useState(false);
    const form = useForm<FormValues>({
        defaultValues: {
            url: "",
            journal: "",
            publisher: "",
        }
    });

    const onSubmit = (data: FormValues) => {
        createRssFeedMutation.mutate({ data }, {
            onError: (error) => toast.error(error?.message ?? "Failed to add this RSS Feed"),
            onSuccess: async () => {
                form.reset();
                setOpen(false);
                toast.success("RSS Feed successfully added");
                await queryClient.invalidateQueries({ queryKey: queryKeys.rssManagerKey() });
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
                                        <Input
                                            {...field}
                                            placeholder="http://feeds.rsc.org/rss/cp"
                                        />
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
                                        <Input
                                            {...field}
                                            placeholder="Publisher Name"
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            }
                        />
                        <Button type="submit" disabled={createRssFeedMutation.isPending || !form.formState.isDirty || !form.formState.isValid}>
                            {createRssFeedMutation.isPending ?
                                <><Loader2 className="animate-spin"/> Adding...</>
                                :
                                "Add Feed"
                            }
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}