import {useState} from "react";
import {createFileRoute} from "@tanstack/react-router";
import {PageTitle} from "@/components/app/base/PageTitle";
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
            <div className="relative bg-cover h-[800px] w-[99.7vw] left-[calc(-50vw+50%)]"/>
            <div className="absolute w-1/2 top-32 left-1/4 flex flex-col items-center">
                <div className="text-4xl md:text-7xl text-center font-semibold mb-14">Welcome to MyLists</div>
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-[320px]">
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
            </div>
        </PageTitle>
    );
}