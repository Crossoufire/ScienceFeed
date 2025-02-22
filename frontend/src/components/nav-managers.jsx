import {Rss, Tags} from "lucide-react";
import {Link} from "@tanstack/react-router";
import {SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem} from "@/components/ui/sidebar";


export function NavManagers() {
    const items = [
        {
            name: "RSS Feeds",
            url: "/rss-manager",
            icon: Rss,
        },
        {
            name: "Keywords",
            url: "/keywords",
            icon: Tags,
        },
    ];

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
