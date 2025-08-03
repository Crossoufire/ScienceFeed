import {queryKeys} from "@/lib/react-query/queryOptions";
import {postGeneralSettings} from "@/server/functions/settings";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {addUserKeyword, deleteUserKeyword, toggleUserKeyword} from "@/server/functions/keywords";
import {addRssFeedsToUser, createRssFeed, fetchUserRssFeeds, removeRssFeedsFromUser} from "@/server/functions/rss-feeds";
import {toast} from "sonner";
import {archiveArticles, deleteArticles} from "@/server/functions/articles";
import {DashboardArticles} from "@/server/types/types";


export const useGeneralMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postGeneralSettings,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.authKey() }),
    });
};


export const useAddKeywordMutation = () => {
    return useMutation({
        mutationFn: addUserKeyword,
    })
}


export const useDeleteKeywordMutation = () => {
    return useMutation({
        mutationFn: deleteUserKeyword,
    })
}


export const useToggleKeywordMutation = () => {
    return useMutation({
        mutationFn: toggleUserKeyword,
    })
}


export const useCreateRssFeedMutation = () => {
    return useMutation({
        mutationFn: createRssFeed,
    })
}

export const useRemoveUserRssFeedMutation = () => {
    return useMutation({
        mutationFn: removeRssFeedsFromUser,
    })
}

export const useAddRssFeedsToUserMutation = () => {
    return useMutation({
        mutationFn: addRssFeedsToUser,
    })
}


export const useArchiveArticles = (queryKey: ReturnType<typeof queryKeys.userArticlesKey>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: archiveArticles,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData<DashboardArticles>(queryKey);
            queryClient.setQueryData<DashboardArticles>(queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    //@ts-expect-error - I don't know the fuck
                    total: oldData.total - variables.data.articleIds.length,
                    //@ts-expect-error - I don't know the fuck
                    articles: oldData.articles.filter((article) => !variables.data.articleIds.includes(article.id)),
                }
            });
            return { previousData };
        },
        onError: (_error, _variables, previousData) => {
            queryClient.setQueryData(queryKey, previousData);
        },
    });
}


export const useDeleteArticles = (queryKey: ReturnType<typeof queryKeys.userArticlesKey>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteArticles,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData<DashboardArticles>(queryKey);
            queryClient.setQueryData<DashboardArticles>(queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    //@ts-expect-error - I don't know the fuck
                    total: oldData.total - variables.data.articleIds.length,
                    //@ts-expect-error - I don't know the fuck
                    articles: oldData.articles.filter((article) => !variables.data.articleIds.includes(article.id)),
                }
            });

            return { previousData };
        },
        onError: (_error, _variables, previousData) => {
            queryClient.setQueryData(queryKey, previousData);
        },
    });
}


export const useRssFetcher = (queryKey: ReturnType<typeof queryKeys.userArticlesKey>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: fetchUserRssFeeds,
        onError: () => toast.error("An error occurred while running the RSS Fetcher"),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey });
            if (data) {
                return toast.warning(data?.warn);
            }
            toast.success("RSS Fetcher successfully finished");
        },
    });
}
