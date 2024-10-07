import {useAuth} from "@/hooks/AuthHook";
import {Button} from "@/components/ui/button";
import {LuAlignJustify} from "react-icons/lu";
import {Loading} from "@/components/app/Loading";
import {useSheet} from "@/providers/SheetProvider";
import {Link as NavLink, useNavigate, useRouter} from "@tanstack/react-router";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle} from "@/components/ui/navigation-menu";


export const Navbar = () => {
    const router = useRouter();
    const navigate = useNavigate();
    const { sheetOpen, setSheetOpen } = useSheet();
    const { currentUser, logout, isLoading } = useAuth();

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
                    <div>{isLoading && <Loading/>}</div>
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
                                <NavLink to="/dashboard" className={navigationMenuTriggerStyle()}>
                                    ScienceFeed
                                </NavLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavLink to="/keywords" className={navigationMenuTriggerStyle()}>
                                    Keywords
                                </NavLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavLink to="/rss-manager" className={navigationMenuTriggerStyle()}>
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
                                <NavLink to="/settings" className={navigationMenuTriggerStyle()}>
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
                            <LuAlignJustify size={28}/>
                        </SheetTrigger>
                        <SheetContent side="left" className="max-sm:w-full">
                            <SheetHeader><SheetTitle></SheetTitle><SheetDescription></SheetDescription></SheetHeader>
                            <NavigationMenu className="mt-3">
                                <NavigationMenuList className="flex flex-col items-start gap-3">
                                    <NavigationMenuItem>
                                        <NavLink to="/dashboard" className={navigationMenuTriggerStyle()}
                                                 onClick={() => setSheetOpen(false)}>
                                            Dashboard
                                        </NavLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavLink to="/keywords" className={navigationMenuTriggerStyle()}
                                                 onClick={() => setSheetOpen(false)}>
                                            Keywords
                                        </NavLink>
                                    </NavigationMenuItem>
                                    <NavigationMenuItem>
                                        <NavLink to="/rss-manager" className={navigationMenuTriggerStyle()}
                                                 onClick={() => setSheetOpen(false)}>
                                            RSS Manager
                                        </NavLink>
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
