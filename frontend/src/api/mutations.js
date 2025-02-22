import {toast} from "sonner";
import {queryClient} from "@/api/queryClient";
import {useMutation} from "@tanstack/react-query";
import {fetcher, postFetcher} from "@/api/fetcher";


const mutationFunctionsMap = {
    resetPassword: ({ token, newPassword }) => postFetcher({
        url: "/tokens/reset_password", data: { token, new_password: newPassword },
    }),
    forgotPassword: ({ email }) => postFetcher({
        url: "/tokens/reset_password_token", data: { email, callback: import.meta.env.VITE_RESET_PASSWORD_CALLBACK },
    }),
    registerToken: ({ token }) => postFetcher({
        url: "/tokens/register_token", data: { token },
    }),
    passwordSettings: ({ data }) => postFetcher({
        url: "/settings/password", data: { ...data },
    }),
    generalSettings: ({ username, sendFeedEmails, maxArticlesPerEmail }) => postFetcher({
        url: "/settings/general",
        data: { username: username, send_feed_emails: sendFeedEmails, max_articles_per_email: maxArticlesPerEmail },
    }),

    addKeyword: ({ name }) => postFetcher({
        url: "/user/add_keyword", data: { name },
    }),
    deleteKeyword: ({ keywordId }) => postFetcher({
        url: "/user/delete_keyword", data: { keyword_id: keywordId },
    }),
    toggleKeyword: ({ keywordId, active }) => postFetcher({
        url: "/user/toggle_keyword", data: { keyword_id: keywordId, active },
    }),

    rssFetcher: () => fetcher({
        url: "/user/rss_feeds/refresh",
    }),
    addRssFeeds: ({ rssFeedsIds }) => postFetcher({
        url: "/user/rss_feed/add", data: { feeds_ids: rssFeedsIds },
    }),
    createRssFeed: ({ publisher, journal, url }) => postFetcher({
        url: "/rss_feed/create", data: { publisher, journal, url },
    }),
    removeRssFeed: ({ rssIds }) => postFetcher({
        url: "/user/rss_feed/remove", data: { rss_ids: rssIds },
    }),

    toggleArticlesRead: ({ articleIds, readValue }) => postFetcher({
        url: "/user/toggle_articles_read", data: { article_ids: articleIds, read: readValue },
    }),
    archiveArticles: ({ articleIds, archive }) => postFetcher({
        url: "/user/archive_articles", data: { article_ids: articleIds, archive },
    }),
    deleteArticles: ({ articleIds, isDeleted }) => postFetcher({
        url: "/user/delete_articles", data: { article_ids: articleIds, is_deleted: isDeleted },
    }),
};


export const useSimpleMutations = () => {
    const resetPassword = useMutation({ mutationFn: mutationFunctionsMap.resetPassword });
    const registerToken = useMutation({ mutationFn: mutationFunctionsMap.registerToken });
    const forgotPassword = useMutation({ mutationFn: mutationFunctionsMap.forgotPassword });

    const passwordSettings = useMutation({ mutationFn: mutationFunctionsMap.passwordSettings });
    const generalSettings = useMutation({ mutationFn: mutationFunctionsMap.generalSettings });

    const addKeyword = useMutation({ mutationFn: mutationFunctionsMap.addKeyword });
    const deleteKeyword = useMutation({ mutationFn: mutationFunctionsMap.deleteKeyword });
    const toggleKeyword = useMutation({ mutationFn: mutationFunctionsMap.toggleKeyword });

    const createRssFeed = useMutation({ mutationFn: mutationFunctionsMap.createRssFeed });
    const removeRssFeed = useMutation({ mutationFn: mutationFunctionsMap.removeRssFeed });
    const addRssFeeds = useMutation({ mutationFn: mutationFunctionsMap.addRssFeeds });

    return {
        createRssFeed, removeRssFeed, addKeyword, deleteKeyword, toggleKeyword, resetPassword, forgotPassword,
        passwordSettings, generalSettings, addRssFeeds, registerToken
    };
};


export const useArticlesRead = (filters) => useMutation({
    mutationFn: mutationFunctionsMap.toggleArticlesRead,
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ["dashboard-articles", filters] });
        const previousData = queryClient.getQueryData(["dashboard-articles", filters]);
        queryClient.setQueryData(["dashboard-articles", filters], (oldData) => ({
            ...oldData,
            articles: oldData.articles.map(article => ({
                ...article,
                is_read: variables.articleIds.includes(article.id) ? variables.readValue : article.is_read,
                read_date: variables.articleIds.includes(article.id) ?
                    variables.readValue ? new Date() : "--"
                    :
                    article.read_date,
            })),
        }));
        return { previousData };
    },
    onError: (error, variables, context) => {
        queryClient.setQueryData(["dashboard-articles", filters], context.previousData);
    },
});


export const useArchiveArticles = (filters, queryKeyString) => useMutation({
    mutationFn: mutationFunctionsMap.archiveArticles,
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: [queryKeyString, filters] });
        const previousData = queryClient.getQueryData([queryKeyString, filters]);
        queryClient.setQueryData([queryKeyString, filters], (oldData) => ({
            ...oldData,
            total: oldData.total - variables.articleIds.length,
            articles: oldData.articles.filter(article => !variables.articleIds.includes(article.id)),
        }));
        return { previousData };
    },
    onError: (error, variables, context) => {
        queryClient.setQueryData([queryKeyString, filters], context.previousData);
    },
});


export const useDeleteArticles = (filters, queryKeyString) => useMutation({
    mutationFn: mutationFunctionsMap.deleteArticles,
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: [queryKeyString, filters] });
        const previousData = queryClient.getQueryData([queryKeyString, filters]);
        queryClient.setQueryData([queryKeyString, filters], (oldData) => ({
            ...oldData,
            total: oldData.total - variables.articleIds.length,
            articles: oldData.articles.filter(article => !variables.articleIds.includes(article.id)),
        }));
        return { previousData };
    },
    onError: (error, variables, context) => {
        queryClient.setQueryData([queryKeyString, filters], context.previousData);
    },
});


export const useRssFetcher = (filters) => useMutation({
    mutationFn: mutationFunctionsMap.rssFetcher,
    onError: () => toast.error("An error occurred while running the RSS Fetcher"),
    onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: ["dashboard-articles", filters] });
        if (data) return toast.warning(data);
        toast.success("RSS Fetcher successfully finished");
    },
});
