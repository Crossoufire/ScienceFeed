import {toast} from "sonner";
import {useState} from "react";
import {useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {PageTitle} from "@/components/page-title";


export const Articles = createFileRoute("/_private/dashboard/articles")({
    loaderDeps: ({ search }) => ({ search } as typeof DEFAULT),
    loader: ({ context: { queryClient }, deps: { search } }) => {
        return queryClient.ensureQueryData(dashboardArticlesOptions(search));
    },
    component: ArticlesPage,
});


const DEFAULT = { search: "", page: 1, keywords_ids: [] };


function ArticlesPage() {
    const navigate = useNavigate();
    const filters = Articles.useSearch();
    const rssFetcherMutation = useRssFetcher(filters);
    // const readArticlesMutation = useArticlesRead(filters);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [activeKeywordsIds, setActiveKeywordsIds] = useState([]);
    const apiData = useSuspenseQuery(dashboardArticlesOptions(filters)).data;
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");
    const deleteArticlesMutation = useDeleteArticles(filters, "dashboard-articles");
    const archiveArticlesMutation = useArchiveArticles(filters, "dashboard-articles");

    const fetchData = async (params) => {
        await navigate({ search: params });
    };

    const onResetClick = async () => {
        setSearchQuery(DEFAULT.search);
        await fetchData({ ...DEFAULT, keywords_ids: activeKeywordsIds });
    };

    const onPageChange = async (newPage) => {
        await fetchData((prev) => ({ ...prev, page: newPage }));
    };

    const onBulkActionClick = (action) => {
        if (action === "select") {
            setSelectedArticles(apiData.articles.map((a) => a.id));
        }
        else if (action === "deselect") {
            setSelectedArticles([]);
        }
            // else if (action === "read") {
            //     onReadClick(selectedArticles, true);
            // }
            // else if (action === "unread") {
            //     onReadClick(selectedArticles, false);
        // }
        else if (action === "archive") {
            onArchiveClick(selectedArticles);
        }
        else if (action === "delete") {
            onDeleteClick(selectedArticles);
        }
    };

    const onEditModeClick = () => {
        setIsEditing(!isEditing);
        setSelectedArticles([]);
    };

    const onSelectionClick = (articleId) => {
        setSelectedArticles((prev) =>
            prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId],
        );
    };

    const onKeywordClick = async (keywordId) => {
        setActiveKeywordsIds((prev) =>
            prev.includes(keywordId) ? prev.filter((k) => k !== keywordId) : [...prev, keywordId],
        );
        await fetchData((prev) => {
            const oldKeywords = prev?.keywords_ids ?? [];
            return {
                ...prev,
                keywords_ids: oldKeywords.includes(keywordId)
                    ? oldKeywords.filter((k) => k !== keywordId)
                    : [...oldKeywords, keywordId],
            };
        });
    };

    // const onReadClick = (articleIds, readValue) => {
    //     readArticlesMutation.mutate(
    //         { articleIds, readValue },
    //         {
    //             onError: () =>
    //                 toast.error("Failed to change the article(s) read status"),
    //         },
    //     );
    // };

    const onArchiveClick = (articleIds) => {
        archiveArticlesMutation.mutate({ articleIds, archive: true }, {
            onError: () => toast.error(`Failed to archived the article(s)`),
        });
    };

    const onDeleteClick = (articleIds) => {
        deleteArticlesMutation.mutate(
            { articleIds, isDeleted: true },
            {
                onError: () => toast.error("Failed to delete the article(s)"),
            },
        );
    };

    const onRssFetcherClick = () => {
        rssFetcherMutation.mutate();
    };

    useDebounceCallback(searchQuery, 350, fetchData, {
        ...filters,
        search: searchQuery,
        keywords_ids: activeKeywordsIds,
    });

    return (
        <PageTitle title={`Articles (${apiData.total})`} subtitle="Your Recent RSS feed articles">
            <div className={cn(rssFetcherMutation.isPending && "opacity-50 pointer-events-none")}>
                <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
                    <InputSearch
                        search={searchQuery}
                        isDisabled={isEditing}
                        onResetClick={onResetClick}
                        onChange={(ev) => setSearchQuery(ev.target.value)}
                    />
                    <OptionsMenu
                        isEditing={isEditing}
                        onEditModeClick={onEditModeClick}
                        onRssFetcherClick={onRssFetcherClick}
                    />
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                    <KeywordsBadges
                        isDisabled={isEditing}
                        keywords={apiData.keywords}
                        onKeywordClick={onKeywordClick}
                        activeKeywordsIds={activeKeywordsIds}
                    />
                </div>
                <div>
                    {isEditing && (
                        <EditionButtons
                            selected={selectedArticles}
                            onBulkActionClick={onBulkActionClick}
                        />
                    )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 h-full max-sm:grid-cols-1">
                    {apiData.articles.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            isEditing={isEditing}
                            // onReadClick={onReadClick}
                            selected={selectedArticles}
                            onDeleteClick={onDeleteClick}
                            onArchiveClick={onArchiveClick}
                            onSelectionClick={onSelectionClick}
                        />
                    ))}
                </div>
                <div className="mt-3">
                    <Pagination
                        isDisabled={isEditing}
                        totalPages={apiData.pages}
                        onChangePage={onPageChange}
                        currentPage={filters?.page ?? DEFAULT.page}
                    />
                </div>
            </div>
        </PageTitle>
    );
}