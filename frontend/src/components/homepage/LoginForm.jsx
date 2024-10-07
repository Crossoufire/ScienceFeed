import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {useAuth} from "@/hooks/AuthHook";
import {Input} from "@/components/ui/input";
import {useLayoutEffect, useState} from "react";
import {FormError} from "@/components/app/FormError";
import {FormButton} from "@/components/app/FormButton";
import {Link, useNavigate, useRouter} from "@tanstack/react-router";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


export const LoginForm = () => {
    const router = useRouter();
    const { login } = useAuth();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [errorMessage, setErrorMessage] = useState("");
    const form = useForm({ defaultValues: { username: "", password: "" }, shouldFocusError: false });

    useLayoutEffect(() => {
        if (!currentUser) return;
        // noinspection JSUnresolvedReference
        void router.invalidate();
        void navigate({ to: `/profile/${currentUser.username}` });
    }, [currentUser]);

    const onSubmit = (data) => {
        setErrorMessage("");
        login.mutate({ username: data.username, password: data.password }, {
            onError: (error) => {
                if (error.status === 401) {
                    return setErrorMessage("Username or password incorrect");
                }
                return toast.error(error.message);
            },
            onSuccess: async () => {
                await navigate({ to: "/dashboard" });
            },
        });
    };

    return (
        <div className="bg-card px-5 p-3 rounded-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
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
                                    <FormLabel>Password</FormLabel>
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
            <Link to="/forgot-password" className="text-blue-500">
                <div className="mt-4">Forgot password?</div>
            </Link>
        </div>
    );
};
