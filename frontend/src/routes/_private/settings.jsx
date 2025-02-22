import {PageTitle} from "@/components/app/PageTitle";
import {createFileRoute} from "@tanstack/react-router";
import {GeneralForm} from "@/components/settings/GeneralForm";
import {PasswordForm} from "@/components/settings/PasswordForm";
import {Separator} from "@/components/ui/separator";


// noinspection JSUnusedGlobalSymbols,JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/settings")({
    component: SettingsPage,
});


function SettingsPage() {
    return (
        <PageTitle title="Settings" subtitle="Customize Your Profile: Manage Your Preferences and Account Settings">
            <div className="grid grid-cols-2 gap-12 mt-4">
                <div>
                    <h3 className="text-lg font-semibold mb-4 bg-secondary py-1.5 px-3 rounded-md">
                        General Settings
                        <Separator/>
                    </h3>
                    <GeneralForm/>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 bg-secondary py-1.5 px-3 rounded-md">
                        Change Password
                        <Separator/>
                    </h3>
                    <PasswordForm/>
                </div>
            </div>

        </PageTitle>
    );
}