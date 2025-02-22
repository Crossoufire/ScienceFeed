import * as React from "react";
import {cn} from "@/utils/functions";
import {NavUser} from "@/components/nav-user";
import {NavManagers} from "@/components/nav-managers";
import {NavDashboard} from "@/components/nav-dashboard";
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar} from "@/components/ui/sidebar";


export function AppSidebar({ ...props }) {
    const { state } = useSidebar();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-1 px-4">
                    <img
                        alt="logo"
                        src="/logo192.png"
                        className={cn("h-6 w-6 mt-1", state === "collapsed" && "h-4 w-4")}
                    />
                    <h3 className={cn("ml-2 mt-2 text-lg font-semibold", state === "collapsed" && "hidden")}>
                        ScienceFeed
                    </h3>
                </div>
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
