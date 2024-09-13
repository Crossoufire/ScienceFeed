import {useMutation} from "@tanstack/react-query";
import {fetcher, postFetcher} from "@/api/fetcher";


const mutationFunctionsMap = {
    resetPassword: ({ token, newPassword }) => postFetcher({
        url: "/tokens/reset_password", data: { token, new_password: newPassword },
    }),
    forgotPassword: ({ email }) => postFetcher({
        url: "/tokens/reset_password_token", data: { email, callback: import.meta.env.VITE_RESET_PASSWORD_CALLBACK },
    }),
    passwordSettings: ({ data }) => postFetcher({
        url: "/settings/password", data: { ...data },
    }),
    generalSettings: ({ username, sendFeedEmails, maxArticlesPerEmail }) => postFetcher({
        url: "/settings/general",
        data: { username: username, send_feed_emails: sendFeedEmails, max_articles_per_email: maxArticlesPerEmail },
    }),
    addKeyword: ({ name }) => postFetcher({
        url: "/add_keyword", data: { name },
    }),
    deleteKeyword: ({ keywordId }) => postFetcher({
        url: "/delete_keyword", data: { keyword_id: keywordId },
    }),
    addRssFeed: ({ publisher, journal, url }) => postFetcher({
        url: "/add_rss_feed", data: { publisher, journal, url },
    }),
    removeRssFeed: ({ rssId }) => postFetcher({
        url: "/remove_rss_feed", data: { rss_id: rssId },
    }),
    toggleArticleRead: ({ articleId, read }) => postFetcher({
        url: "/toggle_article_read", data: { article_id: articleId, read },
    }),
    toggleArchiveArticle: ({ articleId, archive }) => postFetcher({
        url: "/toggle_archive_article", data: { article_id: articleId, archive },
    }),
    toggleKeyword: ({ keywordId, active }) => postFetcher({
        url: "/toggle_keyword", data: { keyword_id: keywordId, active },
    }),
    rssFetcher: () => fetcher({
        url: "/fetch_user_rss",
    }),
    saveRssFeeds: ({ rssFeedsIds }) => postFetcher({
        url: "/save_rss_feeds", data: { rss_feeds_ids: rssFeedsIds },
    }),
    registerToken: ({ token }) => postFetcher({
        url: "/tokens/register_token", data: { token },
    }),
    articleDelete: ({ articleId }) => postFetcher({
        url: "/delete_article", data: { article_id: articleId },
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
    const addRssFeed = useMutation({ mutationFn: mutationFunctionsMap.addRssFeed });
    const removeRssFeed = useMutation({ mutationFn: mutationFunctionsMap.removeRssFeed });
    const articleRead = useMutation({ mutationFn: mutationFunctionsMap.toggleArticleRead });
    const articleArchive = useMutation({ mutationFn: mutationFunctionsMap.toggleArchiveArticle });
    const rssFetcher = useMutation({ mutationFn: mutationFunctionsMap.rssFetcher });
    const saveRssFeeds = useMutation({ mutationFn: mutationFunctionsMap.saveRssFeeds });
    const articleDelete = useMutation({ mutationFn: mutationFunctionsMap.articleDelete });

    return {
        articleRead, articleArchive, addRssFeed, removeRssFeed, addKeyword, deleteKeyword, toggleKeyword, articleDelete,
        resetPassword, forgotPassword, passwordSettings, generalSettings, rssFetcher, saveRssFeeds, registerToken
    };
};
