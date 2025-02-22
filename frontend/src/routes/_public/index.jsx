import {router} from "@/router";
import {useAuth} from "@/hooks/AuthHook";
import {Button} from "@/components/ui/button";
import {Hero} from "@/components/homepage/Hero";
import {useLayoutEffect, useState} from "react";
import {PageTitle} from "@/components/app/PageTitle";
import {Features} from "@/components/homepage/Features";
import {LoginForm} from "@/components/homepage/LoginForm";
import {RegisterForm} from "@/components/homepage/RegisterForm";
import {createFileRoute, useNavigate} from "@tanstack/react-router";


// noinspection JSCheckFunctionSignatures,JSUnusedGlobalSymbols
export const Route = createFileRoute("/_public/")({
    component: HomePage,
});


function HomePage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    useLayoutEffect(() => {
        if (!currentUser) return;
        void router.invalidate();
        void navigate({ to: "/dashboard/articles" });
    }, [currentUser]);

    return (
        <PageTitle title="HomePage" onlyHelmet>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <Hero/>
                <div className="flex items-center justify-center gap-3 mb-12">
                    <Button onClick={() => setShowLogin(true)}>
                        Login
                    </Button>
                    <Button variant="secondary" onClick={() => setShowRegister(true)}>
                        Register
                    </Button>
                </div>
                <LoginForm open={showLogin} onOpenChange={setShowLogin}/>
                <RegisterForm open={showRegister} onOpenChange={setShowRegister}/>
                <Features/>
            </main>
        </PageTitle>
    );
}