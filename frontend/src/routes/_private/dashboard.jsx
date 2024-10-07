import {toast} from "sonner";
import {useEffect, useState} from "react";
import {queryClient} from "@/api/queryClient";
import {Button} from "@/components/ui/button";
import {dashboardOptions} from "@/api/queryOptions";
import {PageTitle} from "@/components/app/PageTitle";
import {Pagination} from "@/components/app/Pagination";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useDebounceCallback} from "@/hooks/DebounceHook";
import {InputSearch} from "@/components/dashboard/InputSearch";
import {OptionsMenu} from "@/components/dashboard/OptionsMenu";
import {ArticleCard} from "@/components/dashboard/ArticleCard";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {KeywordsBadges} from "@/components/dashboard/KeywordsBadges";
import {EditionButtons} from "@/components/dashboard/EditionButtons";
import {simpleMutations, useArchiveArticles, useDeleteArticles, useRssFetcher} from "@/api/mutations";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/dashboard")({
    component: Dashboard,
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context: { queryClient }, deps: { search } }) => queryClient.ensureQueryData(dashboardOptions(search)),
});


const DEFAULT = { search: "", page: 1, keywords_ids: [] };


function Dashboard() {
    const navigate = useNavigate();
    const filters = Route.useSearch();
    const { articlesRead } = simpleMutations();
    const rssFetcherMutation = useRssFetcher(filters);
    const deleteArticlesMutation = useDeleteArticles(filters);
    const [isEditing, setIsEditing] = useState(false);
    const archiveArticlesMutation = useArchiveArticles(filters);
    const apiData = useSuspenseQuery(dashboardOptions(filters)).data;
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [activeKeywordsIds, setActiveKeywordsIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");

    const fetchData = async (params) => {
        // noinspection JSCheckFunctionSignatures
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
            setSelectedArticles(apiData.articles.map(a => a.id));
        }
        else if (action === "deselect") {
            setSelectedArticles([]);
        }
        else if (action === "read") {
            onReadClick(selectedArticles, true);
        }
        else if (action === "unread") {
            onReadClick(selectedArticles, false);
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

    const onSelectionClick = (articleId) => {
        setSelectedArticles((prev) => prev.includes(articleId) ? prev.filter(id => id !== articleId) : [...prev, articleId]);
    };

    const onKeywordClick = async (keywordId) => {
        setActiveKeywordsIds((prev) => prev.includes(keywordId) ? prev.filter(k => k !== keywordId) : [...prev, keywordId]);
        await fetchData((prev) => {
            const oldKeywords = prev?.keywords_ids ?? [];
            return {
                ...prev,
                keywords_ids: oldKeywords.includes(keywordId) ?
                    oldKeywords.filter(k => k !== keywordId) : [...oldKeywords, keywordId],
            };
        });
    };

    const onReadClick = (articleIds, readValue) => {
        articlesRead.mutate({ articleIds, readValue }, {
            onError: () => toast.error("Failed to change the article(s) read status"),
            onSuccess: async () => {
                toast.success("Article(s) status successfully changed");
                await queryClient.invalidateQueries({ queryKey: ["dashboard", filters] });
            },
        });
    };

    const onArchiveClick = (articleIds) => {
        archiveArticlesMutation.mutate({ articleIds, archive: true }, {
            onError: () => toast.error("Failed to archived the article(s)"),
            onSuccess: () => toast.success("Article(s) successfully archived"),
        });
    };

    const onDeleteClick = (articleIds) => {
        deleteArticlesMutation.mutate({ articleIds, isDeleted: true }, {
            onError: () => toast.error("Failed to delete the article(s)"),
            onSuccess: () => {
                toast("Article successfully deleted", {
                    cancel: <CancelButton duration={10000} filters={filters} articleIds={articleIds}/>,
                    duration: 10000,
                });
            },
        });
    };

    const onRssFetcherClick = () => {
        rssFetcherMutation.mutate(undefined, {
            onError: () => toast.error("An error occurred while running the RSS Fetcher"),
            onSuccess: async (data) => {
                if (data) {
                    return toast.warning(data);
                }
                toast.success("RSS Fetcher successfully finished");
            },
        });
    };

    useDebounceCallback(searchQuery, 350, fetchData, {
        search: searchQuery, page: DEFAULT.page, keywords_ids: activeKeywordsIds,
    });

    const isFetching = (
        articlesRead.isPending ||
        deleteArticlesMutation.isPending ||
        archiveArticlesMutation.isPending ||
        rssFetcherMutation.isPending
    );

    return (
        <PageTitle title={`Articles (${apiData.total})`} subtitle="Manage Your RSS feed Articles">
            <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
                <InputSearch
                    search={searchQuery}
                    onResetClick={onResetClick}
                    isDisabled={isEditing || isFetching}
                    onChange={(ev) => setSearchQuery(ev.target.value)}
                />
                <OptionsMenu
                    isEditing={isEditing}
                    isDisabled={isFetching}
                    onEditModeClick={onEditModeClick}
                    onRssFetcherClick={onRssFetcherClick}
                />
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
                <KeywordsBadges
                    keywords={apiData.keywords}
                    onKeywordClick={onKeywordClick}
                    isDisabled={isEditing || isFetching}
                    activeKeywordsIds={activeKeywordsIds}
                />
            </div>
            {isEditing &&
                <EditionButtons
                    isDisabled={isFetching}
                    selected={selectedArticles}
                    onBulkActionClick={onBulkActionClick}
                />
            }
            <div className="w-full mt-4 flex flex-col gap-4">
                {apiData.articles.map(article =>
                    <ArticleCard
                        key={article.id}
                        article={article}
                        isEditing={isEditing}
                        isDisabled={isFetching}
                        onReadClick={onReadClick}
                        selected={selectedArticles}
                        onDeleteClick={onDeleteClick}
                        onArchiveClick={onArchiveClick}
                        onSelectionClick={onSelectionClick}
                    />
                )}
            </div>
            <div className="mt-3">
                <Pagination
                    totalPages={apiData.pages}
                    onChangePage={onPageChange}
                    isDisabled={isFetching || isEditing}
                    currentPage={filters?.page ?? DEFAULT.page}
                />
            </div>
        </PageTitle>
    );
}


function CancelButton({ duration, filters, articleIds }) {
    const deleteArticles = useDeleteArticles(filters);
    const [progress, setProgress] = useState(100);

    const handleUndoClick = () => {
        deleteArticles.mutate({ articleIds, isDeleted: false }, {
            onError: () => toast.error("Failed to undo the article(s) deletion"),
            onSuccess: () => {
                toast.dismiss();
                toast.success("Article(s) successfully restored");
            },
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress > 0) {
                    return prevProgress - (100 / (duration / 100));
                }
                clearInterval(interval);
                return 0;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div className="relative ml-2">
            <Button size="xs" onClick={() => handleUndoClick()} disabled={deleteArticles.isPending}>
                Undo
            </Button>
            <div className="absolute bottom-0 left-0 right-0 h-1 w-full">
                <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear rounded-md"
                />
            </div>
        </div>
    );
}
