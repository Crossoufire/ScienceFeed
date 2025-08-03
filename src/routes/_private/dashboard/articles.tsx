import {toast} from "sonner";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {PageTitle} from "@/components/page-title";
import {Pagination} from "@/components/pagination";
import {useSuspenseQuery} from "@tanstack/react-query";
import {createFileRoute} from "@tanstack/react-router";
import {useDebounceCallback} from "@/hooks/use-debounce";
import {OptionsMenu} from "@/components/articles/options-menu";
import {InputSearch} from "@/components/articles/input-search";
import {ArticleCard} from "@/components/articles/article-card";
import {queryKeys, userArticlesOptions} from "@/lib/react-query";
import {KeywordsBadge} from "@/components/articles/keywords-badge";
import {EditionButtons} from "@/components/articles/edition-buttons";
import {ArticleBulkActions, UserArticlesSearch} from "@/server/types/types";
import {useArchiveArticles, useDeleteArticles, useRssFetcher} from "@/lib/react-query/mutations";


export const Route = createFileRoute("/_private/dashboard/articles")({
    validateSearch: (search) => search as UserArticlesSearch,
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context: { queryClient }, deps: { search } }) => {
        return queryClient.ensureQueryData(userArticlesOptions(search));
    },
    component: ArticlesPage,
});


const DEFAULT = { search: "", page: 1, keywordsIds: [] };


function ArticlesPage() {
    const filters = Route.useSearch();
    const navigate = Route.useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const apiData = useSuspenseQuery(userArticlesOptions(filters)).data;
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? "");
    const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
    const [activeKeywordsIds, setActiveKeywordsIds] = useState<number[]>([]);
    const rssFetcherMutation = useRssFetcher(queryKeys.userArticlesKey(filters));
    const deleteArticlesMutation = useDeleteArticles(queryKeys.userArticlesKey(filters));
    const archiveArticlesMutation = useArchiveArticles(queryKeys.userArticlesKey(filters));

    const fetchData = async (params: UserArticlesSearch) => {
        await navigate({ search: params });
    };

    const onResetClick = async () => {
        setSearchQuery(DEFAULT.search ?? "");
        await fetchData({ ...DEFAULT, keywordsIds: activeKeywordsIds });
    };

    const onPageChange = async (newPage: number) => {
        await fetchData({ ...filters, page: newPage });
    };

    const onBulkActionClick = (action: ArticleBulkActions) => {
        if (action === "select") {
            setSelectedArticles(apiData.articles.map((a) => a.id));
        }
        else if (action === "deselect") {
            setSelectedArticles([]);
        }
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

    const onSelectionClick = (articleId: number) => {
        setSelectedArticles((prev) => prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]);
    };

    const onKeywordClick = async (keywordId: number) => {
        setActiveKeywordsIds((prev) => prev.includes(keywordId) ? prev.filter((k) => k !== keywordId) : [...prev, keywordId]);
        const oldKeys = filters?.keywordsIds ?? [];
        await fetchData({
            ...filters,
            keywordsIds: oldKeys.includes(keywordId) ? oldKeys.filter((k) => k !== keywordId) : [...oldKeys, keywordId],
        });
    };

    const onArchiveClick = (articleIds: number[]) => {
        archiveArticlesMutation.mutate({ data: { articleIds, archive: true } }, {
            onError: () => toast.error(`Failed to archived the article(s)`),
        });
    };

    const onDeleteClick = (articleIds: number[]) => {
        deleteArticlesMutation.mutate({ data: { articleIds, isDeleted: true } }, {
            onError: () => toast.error("Failed to delete the article(s)"),
        });
    };

    const onRssFetcherClick = () => {
        rssFetcherMutation.mutate(undefined);
    };

    useDebounceCallback<UserArticlesSearch>(searchQuery, 350, fetchData, {
        ...filters,
        search: searchQuery,
        keywordsIds: activeKeywordsIds,
    });

    return (
        <PageTitle title={`Articles (${apiData.total})`} subtitle="Your Recent RSS feed articles">
            <div className={cn(rssFetcherMutation.isPending && "opacity-50 pointer-events-none")}>
                <div className="flex flex-wrap items-baseline justify-between gap-4 mt-3">
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
                    <KeywordsBadge
                        isDisabled={isEditing}
                        keywords={apiData.keywords}
                        onKeywordClick={onKeywordClick}
                        activeKeywordsIds={activeKeywordsIds}
                    />
                </div>
                <div>
                    {isEditing &&
                        <EditionButtons
                            selected={selectedArticles}
                            onBulkActionClick={onBulkActionClick}
                        />
                    }
                </div>
                <div className="mb-6 -mt-2">
                    <Pagination
                        isDisabled={isEditing}
                        totalPages={apiData.pages}
                        onChangePage={onPageChange}
                        currentPage={filters?.page ?? DEFAULT.page}
                    />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                    {apiData.articles.map((article) =>
                        <ArticleCard
                            key={article.id}
                            article={article}
                            isEditing={isEditing}
                            selected={selectedArticles}
                            onDeleteClick={onDeleteClick}
                            onArchiveClick={onArchiveClick}
                            onSelectionClick={onSelectionClick}
                        />
                    )}
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