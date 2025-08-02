import {queryOptions} from "@tanstack/react-query";
import {getCurrentUser} from "@/server/functions/auth";


export const queryKeys = {
    authKey: () => ["currentUser"] as const,
};


export const authOptions = () => queryOptions({
    queryKey: queryKeys.authKey(),
    queryFn: () => getCurrentUser(),
    staleTime: 60 * 1000,
});
