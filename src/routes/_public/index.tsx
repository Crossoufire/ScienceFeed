import {toast} from "sonner";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import authClient from "@/lib/auth/auth-client";
import {createFileRoute} from "@tanstack/react-router";
import {Features} from "@/components/homepage/features";


export const Route = createFileRoute("/_public/")({
    component: HomePage,
});


function HomePage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard/articles"
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <section className="pt-28 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Stay Updated with ScienceFeed</h1>
                    <p className="text-xl mb-12">Curate your personal science news feed with RSS and keywords</p>
                </div>
            </section>
            <div className="flex items-center justify-center gap-3 mb-12">
                <Button onClick={handleLogin} disabled={isLoading}>
                    Login with Google
                </Button>
            </div>
            <Features/>
        </main>
    );
}
