import {Rss, Tags} from "lucide-react";
import {Link} from "@tanstack/react-router";
import {SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";


const items = [
    {
        icon: Rss,
        name: "RSS Feeds",
        url: "/rss-manager",
    },
    {
        icon: Tags,
        name: "Keywords",
        url: "/keywords",
    },
];


export function NavManagers() {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Managers</SidebarGroupLabel>
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