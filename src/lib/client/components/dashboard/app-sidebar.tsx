import * as React from "react";
import {FlaskConical} from "lucide-react";
import {NavUser} from "@/lib/client/components/dashboard/nav-user";
import {NavManagers} from "@/lib/client/components/dashboard/nav-managers";
import {NavDashboard} from "@/lib/client/components/dashboard/nav-dashboard";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/lib/client/components/ui/sidebar";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a>
                                <FlaskConical className="mt-0.5 mr-1"/>
                                <span className="shrink-0 text-xl">Science-Feed</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavDashboard/>
                <NavManagers/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
        </Sidebar>
    );
}