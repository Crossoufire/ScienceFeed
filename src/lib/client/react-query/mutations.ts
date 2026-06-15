import {toast} from "sonner";
import {UserArticlesSearch} from "@/lib/schemas/schemas";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {postGeneralSettings} from "@/lib/server/functions/settings";
import {archiveArticles, deleteArticles} from "@/lib/server/functions/articles";
import {authOptions, userArticlesOptions} from "@/lib/client/react-query/queryOptions";
import {addUserKeyword, deleteUserKeyword, toggleUserKeyword} from "@/lib/server/functions/keywords";
import {addRssFeedsToUser, createRssFeed, fetchUserRssFeeds, removeRssFeedsFromUser} from "@/lib/server/functions/rss-feeds";


export const useGeneralMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postGeneralSettings,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: authOptions.queryKey }),
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


export const useArchiveArticles = (filters: UserArticlesSearch) => {
    const queryClient = useQueryClient();
    const queryKey = userArticlesOptions(filters).queryKey;

    return useMutation({
        mutationFn: archiveArticles,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) return;
                return {
                    ...oldData,
                    total: oldData.total - variables.data.articleIds.length,
                    articles: oldData.articles.filter((article) => !variables.data.articleIds.includes(article.id)),
                }
            });
            return { previousData };
        },
        onError: (_error, _variables, previousData) => {
            if (!previousData) return;
            queryClient.setQueryData(queryKey, previousData.previousData);
        },
    });
}


export const useDeleteArticles = (filters: UserArticlesSearch) => {
    const queryClient = useQueryClient();
    const queryKey = userArticlesOptions(filters).queryKey;

    return useMutation({
        mutationFn: deleteArticles,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey });
            const previousData = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData || !variables) return;
                return {
                    ...oldData,
                    total: oldData.total - variables.data.articleIds.length,
                    articles: oldData.articles.filter((article) => !variables.data.articleIds.includes(article.id)),
                }
            });

            return { previousData };
        },
        onError: (_error, _variables, previousData) => {
            if (!previousData) return;
            queryClient.setQueryData(queryKey, previousData.previousData);
        },
    });
}


export const useRssFetcher = (filters: UserArticlesSearch) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: fetchUserRssFeeds,
        onError: () => toast.error("An error occurred while running the RSS Fetcher"),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: userArticlesOptions(filters).queryKey });
            if (data) {
                return toast.warning(data?.warn);
            }
            toast.success("RSS Fetcher successfully finished");
        },
    });
}
