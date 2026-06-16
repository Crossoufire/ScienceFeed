import {Slash} from "lucide-react";
import {authOptions} from "@/lib/client/react-query";
import {Separator} from "@/lib/client/components/ui/separator";
import {AppSidebar} from "@/lib/client/components/dashboard/app-sidebar";
import {createFileRoute, Outlet, redirect, useLocation} from "@tanstack/react-router";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/lib/client/components/ui/sidebar";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from "@/lib/client/components/ui/breadcrumb";


export const Route = createFileRoute("/_private")({
    beforeLoad: ({ context: { queryClient } }) => {
        const currentUser = queryClient.getQueryData(authOptions.queryKey);

        if (!currentUser) {
            throw redirect({ to: "/", replace: true });
        }
    },
    component: PrivateLayout,
});


function PrivateLayout() {
    const location = useLocation();

    const crumbs: Record<string, string> = {
        "/dashboard/articles": "Articles",
        "/dashboard/archived": "Archived",
        "/dashboard/trash-bin": "Trash Bin",
        "/rss-manager": "RSS Feeds",
        "/keywords": "Keywords",
        "/settings": "Settings",
    };

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header
                    className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 bg-background/95 backdrop-blur transition-[width,height] ease-linear
                    group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex min-w-0 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1"/>
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb className="min-w-0">
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    {location.pathname.indexOf("dashboard") > -1 ?
                                        "Dashboard" : "Managers"
                                    }
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block">
                                    <Slash/>
                                </BreadcrumbSeparator>
                                <BreadcrumbItem className="min-w-0">
                                    <BreadcrumbPage className="truncate">
                                        {crumbs[location.pathname]}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="mx-auto mb-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <Outlet/>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
