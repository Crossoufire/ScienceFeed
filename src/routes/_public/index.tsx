import React from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import authClient from "@/lib/auth/auth-client";
import {createFileRoute} from "@tanstack/react-router";


export const Route = createFileRoute("/_public/")({
    component: HomePage,
});


function HomePage() {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard"
        }, {
            onRequest: () => {
                setIsLoading(true);
            },
            onError: (ctx) => {
                setIsLoading(false);
                toast.error(ctx.error.message);
            },
        })
    }

    return (
        <div className="min-h-dvh flex justify-center items-center">
            <Button onClick={handleLogin} disabled={isLoading}>
                Login with Google
            </Button>
        </div>
    );
}
