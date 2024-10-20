import {toast} from "sonner";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useAuth} from "@/hooks/AuthHook";
import {Input} from "@/components/ui/input";
import {FormError} from "@/components/app/FormError";
import {FormButton} from "@/components/app/FormButton";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


export const RegisterForm = ({ onTabChange }) => {
    const { register } = useAuth();
    const [errors, setErrors] = useState({});
    const form = useForm({
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        shouldFocusError: false,
    });

    const onSubmit = async (data) => {
        setErrors({});

        const dataToSend = {
            username: data.username,
            email: data.email,
            password: data.password,
            callback: import.meta.env.VITE_REGISTER_CALLBACK,
        };

        register.mutate({ params: dataToSend }, {
            onError: (error) => {
                if (error?.errors) {
                    return setErrors(error.errors.json);
                }
                return toast.error(error.description);
            },
            onSuccess: async () => {
                toast.success("Your account has been created. Check your email to activate your account");
                onTabChange("login");
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-center">
                    Create an account
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                rules={{
                                    required: "Username is required",
                                    minLength: { value: 3, message: "The username is too short (3 min)" },
                                    maxLength: { value: 15, message: "The username is too long (15 max)" },
                                }}
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
                            {errors?.username && <FormError message={errors.username}/>}
                            <FormField
                                control={form.control}
                                name="email"
                                rules={{ required: "Email is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="john.doe@example.com"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            {errors?.email && <FormError message={errors.email}/>}
                            <FormField
                                control={form.control}
                                name="password"
                                rules={{
                                    required: "Password is required",
                                    minLength: { value: 8, message: "The password must have at least 8 characters" },
                                }}
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
                            {errors?.password && <FormError message={errors.password}/>}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                rules={{
                                    validate: (val) => {
                                        // noinspection JSCheckFunctionSignatures
                                        if (form.watch("password") !== val) {
                                            return "The passwords do not match";
                                        }
                                    }
                                }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
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
                        <FormButton disabled={register.isPending}>
                            Create an account
                        </FormButton>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};
