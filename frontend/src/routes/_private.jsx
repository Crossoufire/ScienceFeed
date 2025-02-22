import * as React from "react";
import {api} from "@/api/apiClient";
import {AppSidebar} from "@/components/app-sidebar";
import {Separator} from "@/components/ui/separator";
import {createFileRoute, Outlet, redirect, useLocation} from "@tanstack/react-router";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from "@/components/ui/breadcrumb";


// noinspection JSCheckFunctionSignatures,JSUnusedGlobalSymbols
export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context: { auth } }) => {
        if (!auth.currentUser || !api.isAuthenticated()) {
            throw redirect({ to: "/" });
        }
    },
    component: PrivateLayout,
});


export function PrivateLayout() {
    const location = useLocation();

    const crumbs = {
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
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear
                group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    {location.pathname.indexOf("dashboard") > -1 ? "Dashboard" : "Managers"}
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{crumbs[location.pathname]}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="p-4 pt-0 max-w-7xl">
                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
