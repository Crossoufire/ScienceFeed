import {useState} from "react";
import {createFileRoute} from "@tanstack/react-router";
import {PageTitle} from "@/components/app/PageTitle";
import {LoginForm} from "@/components/homepage/LoginForm";
import {RegisterForm} from "@/components/homepage/RegisterForm";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


// noinspection JSCheckFunctionSignatures,JSUnusedGlobalSymbols
export const Route = createFileRoute("/_public/")({
    component: HomePage,
});


function HomePage() {
    const [activeTab, setActiveTab] = useState("login");

    const onTabChange = (newTab) => {
        setActiveTab(newTab);
    };

    return (
        <PageTitle title="HomePage" onlyHelmet>
            <div className="text-4xl md:text-7xl text-center font-semibold mb-14 mt-14">Welcome to ScienceFeed</div>
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-[320px] mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <LoginForm/>
                </TabsContent>
                <TabsContent value="register">
                    <RegisterForm onTabChange={onTabChange}/>
                </TabsContent>
            </Tabs>
        </PageTitle>
    );
}