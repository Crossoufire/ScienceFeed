import {toast} from "sonner";
import * as React from "react";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useAuth} from "@/hooks/use-auth";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {GeneralSettings} from "@/server/types/types";
import {useGeneralMutation} from "@/lib/react-query/mutations";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


export const GeneralForm = () => {
    const { currentUser } = useAuth();
    const form = useForm<GeneralSettings>();
    const generalFormMutation = useGeneralMutation();
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = (data: GeneralSettings) => {
        setErrorMessage("");

        generalFormMutation.mutate({ data }, {
            onError: (error) => setErrorMessage(error.message),
            onSuccess: () => toast.success("Settings successfully updated"),
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-[350px] max-sm:w-full">
                <div className="space-y-8">
                    {errorMessage &&
                        <p className="text-destructive text-sm">
                            {errorMessage}
                        </p>
                    }
                    <FormField
                        control={form.control}
                        name="name"
                        rules={{
                            minLength: { value: 3, message: "The username is too short (3 min)" },
                            maxLength: { value: 15, message: "The username is too long (15 max)" },
                        }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        defaultValue={currentUser?.name}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sendFeedEmails"
                        render={({ field }) =>
                            <FormItem>
                                <FormLabel>Send Mails (once a week)</FormLabel>
                                <FormDescription>Most recent non-read articles</FormDescription>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            defaultChecked={currentUser?.sendFeedEmails ?? true}
                                        />
                                    </FormControl>
                                    <div className="leading-none text-sm">
                                        <span>&nbsp; Send</span>
                                    </div>
                                </div>
                            </FormItem>
                        }
                    />
                    <FormField
                        control={form.control}
                        name="maxArticlesPerEmail"
                        render={({ field }) =>
                            <FormItem>
                                <FormLabel>Articles Send / Email</FormLabel>
                                <FormDescription>Between 1 and 50</FormDescription>
                                <FormControl>
                                    <Input
                                        {...field}
                                        min={1}
                                        max={50}
                                        type="number"
                                        className="w-[80px]"
                                        defaultValue={currentUser?.maxArticlesPerEmail}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        }
                    />
                </div>
                <Button className="mt-6" disabled={generalFormMutation.isPending}>
                    Update
                </Button>
            </form>
        </Form>
    );
};