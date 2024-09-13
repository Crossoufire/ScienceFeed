import {useAuth} from "@/hooks/AuthHook";
import {Button} from "@/components/ui/button";
import {LuAlignJustify} from "react-icons/lu";
import {useSheet} from "@/providers/SheetProvider";
import {Loading} from "@/components/app/base/Loading";
import {Link as NavLink} from "@tanstack/react-router";
import * as Nav from "@/components/ui/navigation-menu";
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";


export const Navbar = () => {
    const { sheetOpen, setSheetOpen } = useSheet();
    const { currentUser, logout, isLoading } = useAuth();

    // Login page and public pages when not logged
    if (!currentUser) {
        return (
            <nav className="w-screen z-50 flex items-center fixed top-0 h-16 border-b border-b-neutral-700 bg-background">
                <div className="md:max-w-screen-xl flex w-full justify-between items-center container">
                    <NavLink to="/" className="text-lg font-semibold">ScienceFeed</NavLink>
                    <div>{isLoading && <Loading/>}</div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-screen z-50 flex items-center fixed top-0 h-16 border-b border-b-neutral-700 bg-background">
            <div className="md:max-w-screen-xl flex w-full justify-between items-center container">
                <div className="hidden lg:block">
                    <Nav.NavigationMenu>
                        <Nav.NavigationMenuList>
                            <Nav.NavigationMenuItem>
                                <NavLink to="/dashboard" className={Nav.navigationMenuTriggerStyle()}>
                                    ScienceFeed
                                </NavLink>
                            </Nav.NavigationMenuItem>
                            <Nav.NavigationMenuItem>
                                <NavLink to="/keywords" className={Nav.navigationMenuTriggerStyle()}>
                                    Keywords
                                </NavLink>
                            </Nav.NavigationMenuItem>
                            <Nav.NavigationMenuItem>
                                <NavLink to="/rss-manager" className={Nav.navigationMenuTriggerStyle()}>
                                    RSS Manager
                                </NavLink>
                            </Nav.NavigationMenuItem>
                        </Nav.NavigationMenuList>
                    </Nav.NavigationMenu>
                </div>
                <div className="hidden lg:block">
                    <Nav.NavigationMenu>
                        <Nav.NavigationMenuList>
                            <Nav.NavigationMenuItem>
                                <NavLink to="/settings" className={Nav.navigationMenuTriggerStyle()}>
                                    Settings
                                </NavLink>
                            </Nav.NavigationMenuItem>
                            <Nav.NavigationMenuItem>
                                <Button variant="ghost" onClick={() => logout.mutate()} className="text-lg font-semibold">
                                    Logout
                                </Button>
                            </Nav.NavigationMenuItem>
                        </Nav.NavigationMenuList>
                    </Nav.NavigationMenu>
                </div>
                <div className="lg:hidden ml-auto mr-2">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger className="flex items-center">
                            <LuAlignJustify size={28}/>
                        </SheetTrigger>
                        <SheetContent side="left" className="max-sm:w-full">
                            <SheetHeader><SheetTitle></SheetTitle><SheetDescription></SheetDescription></SheetHeader>
                            <Nav.NavigationMenu className="mt-3">
                                <Nav.NavigationMenuList className="flex flex-col items-start gap-3">
                                    <Nav.NavigationMenuItem>
                                        <NavLink to="/dashboard" className={Nav.navigationMenuTriggerStyle()}
                                                 onClick={() => setSheetOpen(false)}>
                                            Dashboard
                                        </NavLink>
                                    </Nav.NavigationMenuItem>
                                    <Nav.NavigationMenuItem>
                                        <NavLink to="/keywords" className={Nav.navigationMenuTriggerStyle()}
                                                 onClick={() => setSheetOpen(false)}>
                                            Keywords
                                        </NavLink>
                                    </Nav.NavigationMenuItem>
                                    <Nav.NavigationMenuItem>
                                        <NavLink to="/rss-manager" className={Nav.navigationMenuTriggerStyle()}
                                                 onClick={() => setSheetOpen(false)}>
                                            RSS Manager
                                        </NavLink>
                                    </Nav.NavigationMenuItem>
                                </Nav.NavigationMenuList>
                            </Nav.NavigationMenu>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};
