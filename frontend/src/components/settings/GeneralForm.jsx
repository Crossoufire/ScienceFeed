import {toast} from "sonner";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useAuth} from "@/hooks/AuthHook";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {useSimpleMutations} from "@/api/mutations";
import {Separator} from "@/components/ui/separator";
import {FormError} from "@/components/app/FormError";
import {FormButton} from "@/components/app/FormButton";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


export const GeneralForm = () => {
    const form = useForm();
    const { generalSettings } = useSimpleMutations();
    const { currentUser, setCurrentUser } = useAuth();
    const [errorMessage, setErrorMessage] = useState("");

    const onSubmit = (data) => {
        setErrorMessage("");

        generalSettings.mutate({ ...data }, {
            onError: (error) => setErrorMessage(error.description),
            onSuccess: (data) => {
                setCurrentUser(data);
                toast.success("Settings successfully updated");
            },
        });
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] max-sm:w-full">
                    <div className="space-y-5">
                        {errorMessage && <FormError message={errorMessage}/>}
                        <FormField
                            control={form.control}
                            name="username"
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
                                            defaultValue={currentUser.username}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <h3 className="text-base font-medium">
                            Mails Settings (Send once a week)
                            <Separator/>
                        </h3>
                        <FormField
                            control={form.control}
                            name="sendFeedEmails"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            defaultChecked={currentUser.send_feed_emails}
                                        />
                                    </FormControl>
                                    <div className="leading-none">
                                        <FormLabel>&nbsp; Send feed emails</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxArticlesPerEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Articles Per Email</FormLabel>
                                    <FormDescription>Between 1 and 50</FormDescription>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            min={1}
                                            max={50}
                                            type="number"
                                            className="w-[80px]"
                                            defaultValue={currentUser.max_articles_per_email}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormButton className="mt-6" disabled={generalSettings.isPending}>
                        Update
                    </FormButton>
                </form>
            </Form>
        </div>
    );
};
