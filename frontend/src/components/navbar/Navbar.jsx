import {useAuth} from "@/hooks/AuthHook";
import {AlignJustify} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useSheet} from "@/providers/SheetProvider";
import {Link as NavLink, useNavigate, useRouter} from "@tanstack/react-router";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {NavigationMenu, NavigationMenuItem, NavigationMenuList, navTrigStyle} from "@/components/ui/navigation-menu";


export const Navbar = () => {
    const router = useRouter();
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { sheetOpen, setSheetOpen } = useSheet();

    const logoutUser = () => {
        logout.mutate(undefined, {
            onSuccess: async () => {
                // noinspection JSUnresolvedReference
                await router.invalidate().then(() => {
                    navigate({ to: "/" });
                });
            },
        });
    };

    // Login page and public pages when not logged
    if (!currentUser) {
        return (
            <nav className="w-screen z-50 flex items-center fixed top-0 h-14 border-b border-b-neutral-700 bg-background">
                <div className="md:max-w-screen-lg flex w-full justify-between items-center container">
                    <NavLink to="/" className="text-base font-semibold">ScienceFeed</NavLink>
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-screen z-50 flex items-center fixed top-0 h-14 border-b border-b-neutral-700 bg-background">
            <div className="md:max-w-screen-lg flex w-full justify-between items-center container">
                <div className="hidden lg:block">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavLink to="/dashboard" className={navTrigStyle()}>
                                    ScienceFeed
                                </NavLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavLink to="/keywords" className={navTrigStyle()}>
                                    Keywords
                                </NavLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavLink to="/rss-manager" className={navTrigStyle()}>
                                    RSS Manager
                                </NavLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="hidden lg:block">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavLink to="/settings" className={navTrigStyle()}>
                                    Settings
                                </NavLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Button variant="ghost" size="sm" onClick={logoutUser} className="text-base font-semibold">
                                    Logout
                                </Button>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="lg:hidden ml-auto mr-2">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger className="flex items-center">
                            <AlignJustify size={28}/>
                        </SheetTrigger>
                        <SheetContent side="left" className="max-sm:w-full">
                            <SheetHeader><SheetTitle></SheetTitle><SheetDescription></SheetDescription></SheetHeader>
                            <NavigationMenu className="mt-3">
                                <NavigationMenuList className="flex flex-col items-start gap-3">
                                    <NavigationMenuItem>
                                        <NavLink to="/dashboard" className={navTrigStyle()} onClick={() => setSheetOpen(false)}>
                                            Dashboard
                                        </NavLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavLink to="/keywords" className={navTrigStyle()} onClick={() => setSheetOpen(false)}>
                                            Keywords
                                        </NavLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavLink to="/rss-manager" className={navTrigStyle()} onClick={() => setSheetOpen(false)}>
                                            RSS Manager
                                        </NavLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavLink to="/settings" className={navTrigStyle()}>
                                            Settings
                                        </NavLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <Button variant="ghost" size="sm" onClick={logoutUser} className="text-base font-semibold">
                                            Logout
                                        </Button>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};
