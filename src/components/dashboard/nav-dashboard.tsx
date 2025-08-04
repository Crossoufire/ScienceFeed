import {Link} from "@tanstack/react-router";
import {Archive, Newspaper, Trash} from "lucide-react";
import {SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";


const items = [
    {
        icon: Newspaper,
        name: "Articles",
        url: "/dashboard/articles",
    },
    {
        icon: Archive,
        name: "Archived",
        url: "/dashboard/archived",
    },
    {
        icon: Trash,
        name: "Trash Bin",
        url: "/dashboard/trash-bin",
    },
];


export function NavDashboard() {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton tooltip={item.name} asChild>
                            <Link to={item.url}>
                                <item.icon/>
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}