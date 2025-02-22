import {Link} from "@tanstack/react-router";
import {Archive, Newspaper, Trash} from "lucide-react";
import {SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";


export function NavDashboard() {
    const items = [
        {
            name: "Articles",
            url: "/dashboard/articles",
            icon: Newspaper,
        },
        {
            name: "Archived",
            url: "/dashboard/archived",
            icon: Archive,
        },
        {
            name: "Trash",
            url: "/dashboard/trashed",
            icon: Trash,
        },
    ];

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton tooltip={item.name} asChild>
                            <Link to={item.url}>
                                <item.icon/>
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
