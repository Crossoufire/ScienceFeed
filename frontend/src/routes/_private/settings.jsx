import {useState} from "react";
import {Sidebar} from "@/components/app/Sidebar";
import {createFileRoute} from "@tanstack/react-router";
import {PageTitle} from "@/components/app/PageTitle";
import {GeneralForm} from "@/components/settings/GeneralForm";
import {PasswordForm} from "@/components/settings/PasswordForm";


// noinspection JSUnusedGlobalSymbols,JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/settings")({
    component: SettingsPage,
});


function SettingsPage() {
    const [selectedTab, handleTabChange] = useState("General");

    const tabConfig = [
        { sidebarTitle: "General", form: <GeneralForm/> },
        { sidebarTitle: "Password", form: <PasswordForm/> },
    ];

    return (
        <PageTitle title="Settings" subtitle="Customize Your Profile: Manage Your Preferences and Account Settings">
            <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr] gap-10 mt-6">
                <Sidebar
                    items={tabConfig}
                    selectedTab={selectedTab}
                    onTabChange={handleTabChange}
                />
                {tabConfig.find(tab => tab.sidebarTitle === selectedTab)?.form}
            </div>
        </PageTitle>
    );
}