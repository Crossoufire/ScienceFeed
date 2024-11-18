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


export const simpleMutations = () => {
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
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["dashboard", filters] }),
});


export const useArchiveArticles = (filters) => useMutation({
    mutationFn: mutationFunctionsMap.archiveArticles,
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["dashboard", filters] }),
});


export const useRssFetcher = (filters) => useMutation({
    mutationFn: mutationFunctionsMap.rssFetcher,
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["dashboard", filters] }),
});


export const useDeleteArticles = (filters) => useMutation({
    mutationFn: mutationFunctionsMap.deleteArticles,
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["dashboard", filters] }),
});
