import {lazy} from "react";
import {Toaster} from "@/components/ui/sonner";
import {createRootRouteWithContext, Outlet} from "@tanstack/react-router";


// noinspection JSUnusedGlobalSymbols
export const Route = createRootRouteWithContext()({
    component: RootComponent,
});


function RootComponent() {
    return (
        <>
            <Toaster/>
            <Outlet/>
            {/*<Footer/>*/}
            {/*{import.meta.env.DEV && <TanStackRouterDevtools/>}*/}
            {import.meta.env.DEV && <ReactQueryDevtools/>}
        </>
    );
}


const TanStackRouterDevtools = lazy(() =>
    import("@tanstack/router-devtools").then((res) => ({ default: res.TanStackRouterDevtools }))
);

const ReactQueryDevtools = lazy(() =>
    import("@tanstack/react-query-devtools").then((res) => ({ default: res.ReactQueryDevtools }))
);
