import {routeTree} from "./routeTree.gen";
import {QueryClient} from "@tanstack/react-query";
import {createRouter} from "@tanstack/react-router";
import {DefaultNotFound} from "@/lib/client/components/default-not-found";
import {setupRouterSsrQueryIntegration} from "@tanstack/react-router-ssr-query";
import {DefaultCatchBoundary} from "@/lib/client/components/default-catch-boundary";


export function getRouter() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 2 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    });

    const router = createRouter({
        routeTree,
        context: { queryClient },
        defaultPreload: false,
        defaultPreloadStaleTime: 0,
        defaultErrorComponent: DefaultCatchBoundary,
        defaultNotFoundComponent: DefaultNotFound,
        defaultPendingMs: 1000,
        defaultPendingMinMs: 500,
        scrollRestoration: true,
        defaultStructuralSharing: true,
    });

    setupRouterSsrQueryIntegration({
        router,
        queryClient,
        handleRedirects: true,
        wrapQueryClient: true,
    });

    return router;
}
