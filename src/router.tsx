import {toast} from "sonner";
import {routeTree} from "./routeTree.gen";
import {createRouter} from "@tanstack/react-router";
import {DefaultNotFound} from "@/lib/client/components/default-not-found";
import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";
import {setupRouterSsrQueryIntegration} from "@tanstack/react-router-ssr-query";
import {DefaultCatchBoundary} from "@/lib/client/components/default-catch-boundary";


export function getRouter() {
    const queryClient = new QueryClient({
        queryCache: new QueryCache({
            onError: (error, query) => {
                if (query?.meta?.displayErrorMsg) {
                    toast.error(error.message);
                }
                if (query?.meta?.errorMessage) {
                    toast.error(query.meta.errorMessage.toString());
                }
            },
        }),
        mutationCache: new MutationCache({
            onError: (error) => {
                toast.error(error.message);
            },
        }),
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
