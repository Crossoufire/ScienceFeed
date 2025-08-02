/// <reference types="vite/client"/>
import appCss from "@/styles.css?url";
import React, {lazy, Suspense} from "react";
import {authOptions} from "@/lib/react-query";
import {Toaster} from "@/components/ui/sonner";
import {useNProgress} from "@/hooks/use-nprogress";
import type {QueryClient} from "@tanstack/react-query";
import {ThemeProvider} from "@/components/theme-provider";
import {createRootRouteWithContext, HeadContent, Outlet, Scripts,} from "@tanstack/react-router";


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    beforeLoad: async ({ context: { queryClient } }) => {
        return queryClient.fetchQuery(authOptions());
    },
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "ScienceFeed" },
            { name: "description", content: "A science rss feed for the web." },
        ],
        links: [{ rel: "stylesheet", href: appCss }],
    }),
    component: RootComponent,
});


function RootComponent() {
    return (
        <RootDocument>
            <Suspense fallback={<div>Loading...</div>}>
                <Outlet/>
            </Suspense>
        </RootDocument>
    );
}


function RootDocument({ children }: { readonly children: React.ReactNode }) {
    useNProgress();

    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <HeadContent/>
        </head>
        <body>

        <ThemeProvider>
            <Toaster richColors/>
            {children}
        </ThemeProvider>

        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left"/>}
        {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-right"/>}

        <Scripts/>
        </body>
        </html>
    );
}


const TanStackRouterDevtools = lazy(() =>
    import("@tanstack/react-router-devtools").then((res) => ({ default: res.TanStackRouterDevtools }))
);

const ReactQueryDevtools = lazy(() =>
    import("@tanstack/react-query-devtools").then((res) => ({ default: res.ReactQueryDevtools }))
);