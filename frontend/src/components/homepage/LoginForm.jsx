import {toast} from "sonner";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useAuth} from "@/hooks/AuthHook";
import {Input} from "@/components/ui/input";
import {Link} from "@tanstack/react-router";
import {FormError} from "@/components/app/FormError";
import {FormButton} from "@/components/app/FormButton";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


export const LoginForm = ({ open, onOpenChange }) => {
    const { login } = useAuth();
    const [errorMessage, setErrorMessage] = useState("");
    const form = useForm({ defaultValues: { username: "", password: "" }, shouldFocusError: false });

    const onSubmit = (data) => {
        setErrorMessage("");
        login.mutate({ username: data.username, password: data.password }, {
            onError: (error) => {
                if (error.status === 401) {
                    return setErrorMessage("Username or password incorrect");
                }
                return toast.error(error.message);
            },
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-neutral-950">
                <DialogHeader>
                    <DialogTitle>Login to ScienceFeed</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-3">
                        <div className="space-y-6">
                            <FormField
                                control={form.control}
                                name="username"
                                rules={{ required: "Please enter a valid username" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Username"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                rules={{ required: "This field is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            Password
                                            <Link to="/forgot-password" tabIndex="-1" onClick={() => onOpenChange(false)}>
                                                <div className="underline font-normal text-sm">Forgot password?</div>
                                            </Link>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="********"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {errorMessage && <FormError message={errorMessage}/>}
                        <FormButton disabled={login.isPending}>
                            Login
                        </FormButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
