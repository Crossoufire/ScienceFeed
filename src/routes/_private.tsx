import {Slash} from "lucide-react";
import {queryKeys} from "@/lib/react-query";
import {CurrentUser} from "@/server/types/types";
import {Separator} from "@/components/ui/separator";
import {AppSidebar} from "@/components/dashboard/app-sidebar";
import {createFileRoute, Outlet, redirect, useLocation} from "@tanstack/react-router";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from "@/components/ui/breadcrumb";


export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context: { queryClient } }) => {
        const currentUser: CurrentUser = queryClient.getQueryData(queryKeys.authKey());
        if (!currentUser) {
            throw redirect({ to: "/" });
        }
    },
    component: PrivateLayout,
});


export function PrivateLayout() {
    const location = useLocation();

    const crumbs: Record<string, string> = {
        "/dashboard/articles": "Articles",
        "/dashboard/archived": "Archived",
        "/dashboard/trashed": "Trash",
        "/rss-manager": "RSS Feeds",
        "/keywords": "Keywords",
        "/settings": "Settings",
    };

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear
                    group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 z-50">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    {location.pathname.indexOf("dashboard") > -1 ?
                                        "Dashboard" : "Managers"
                                    }
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block">
                                    <Slash/>
                                </BreadcrumbSeparator>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {crumbs[location.pathname]}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="w-6xl mx-auto mb-20">
                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}