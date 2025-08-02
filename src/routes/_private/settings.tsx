import {PageTitle} from "@/components/page-title";
import {createFileRoute} from "@tanstack/react-router";
import {GeneralForm} from "@/components/settings/general-form";


export const Route = createFileRoute("/_private/settings")({
    component: SettingsPage,
});


function SettingsPage() {
    return (
        <PageTitle title="Settings" subtitle="Customize Your Profile: Manage Your Preferences and Account Settings">
            <div className="mt-8">
                <GeneralForm/>
            </div>
        </PageTitle>
    );
}