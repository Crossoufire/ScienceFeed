import {router} from "@/router";
import {useAuth} from "@/hooks/AuthHook";
import {Link, useNavigate} from "@tanstack/react-router";
import {ChevronsUpDown, Cog, LogOut} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage,} from "@/components/ui/avatar";
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar} from "@/components/ui/sidebar";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";


export function NavUser() {
    const navigate = useNavigate();
    const { isMobile } = useSidebar();
    const { currentUser, logout } = useAuth();

    const logoutUser = () => {
        logout.mutate(undefined, {
            onSuccess: async () => await router.invalidate().then(() => navigate({ to: "/" })),
        });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src="#" alt={currentUser.username}/>
                                <AvatarFallback className="rounded-lg">{currentUser.username.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{currentUser.username}</span>
                                <span className="truncate text-xs">{currentUser.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                         side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
                        <DropdownMenuItem asChild>
                            <Link to="/settings">
                                <Cog/> Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => logoutUser()}>
                            <LogOut className="w-5 h-5"/> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
