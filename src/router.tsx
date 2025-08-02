import {toast} from "sonner";
import {routeTree} from "./routeTree.gen";
import {DefaultNotFound} from "@/components/default-not-found";
import {routerWithQueryClient} from "@tanstack/react-router-with-query";
import {DefaultCatchBoundary} from "@/components/default-catch-boundary";
import {createRouter as createTanStackRouter} from "@tanstack/react-router";
import {MutationCache, QueryCache, QueryClient} from "@tanstack/react-query";


export function createRouter() {
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

    return routerWithQueryClient(
        createTanStackRouter({
            routeTree,
            context: { queryClient },
            defaultSsr: false,
            defaultPreload: false,
            scrollRestoration: true,
            defaultPreloadStaleTime: 0,
            defaultStructuralSharing: true,
            defaultNotFoundComponent: DefaultNotFound,
            defaultErrorComponent: DefaultCatchBoundary,
        }),
        queryClient,
    );
}


declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof createRouter>;
    }
}
