import {toast} from "sonner";
import {useState} from "react";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useDeleteArticles} from "@/api/mutations";
import {PageTitle} from "@/components/app/PageTitle";
import {Pagination} from "@/components/app/Pagination";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useDebounceCallback} from "@/hooks/DebounceHook";
import {dashboardDeletedOptions} from "@/api/queryOptions";
import {InputSearch} from "@/components/dashboard/InputSearch";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {DeletedArticleCard} from "@/components/dashboard/DeletedArticleCard";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/dashboard/trashed")({
    component: Trashed,
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context: { queryClient }, deps: { search } }) => queryClient.ensureQueryData(dashboardDeletedOptions(search)),
});


const DEFAULT = { search: "", page: 1 };


function Trashed() {
    const navigate = useNavigate();
    const filters = Route.useSearch();
    const [showWarning, setShowWarning] = useState(true);
    const apiData = useSuspenseQuery(dashboardDeletedOptions(filters)).data;
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");
    const deleteArticlesMutation = useDeleteArticles(filters, "dashboard-deleted",);

    const fetchData = async (params) => {
        // noinspection JSCheckFunctionSignatures
        await navigate({ search: params });
    };

    const onResetClick = async () => {
        setSearchQuery(DEFAULT.search);
        await fetchData({ ...DEFAULT });
    };

    const onPageChange = async (newPage) => {
        await fetchData((prev) => ({ ...prev, page: newPage }));
    };

    const onDeleteClick = (articleIds) => {
        deleteArticlesMutation.mutate(
            { articleIds, isDeleted: false },
            {
                onError: () => toast.error("Failed to un-delete the article(s)"),
            },
        );
    };

    useDebounceCallback(searchQuery, 350, fetchData, { ...filters, search: searchQuery });

    return (
        <PageTitle title={`Deleted Articles (${apiData.total})`} subtitle="Manage Your Deleted Articles">
            {showWarning && (
                <div className="mt-4 mb-1 py-1 px-3 bg-destructive text-destructive-foreground rounded-lg">
                    <div className="flex justify-between items-center">
                        <p>The trashed articles are automatically deleted after 60 days.</p>
                        <Button size="icon" variant="destructive" onClick={() => setShowWarning(false)}>
                            <X/>
                        </Button>
                    </div>
                </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
                <InputSearch
                    search={searchQuery}
                    onResetClick={onResetClick}
                    onChange={(ev) => setSearchQuery(ev.target.value)}
                />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 h-full max-sm:grid-cols-1">
                {apiData.articles.map((article) => (
                    <DeletedArticleCard
                        key={article.id}
                        article={article}
                        onDeleteClick={onDeleteClick}
                    />
                ))}
            </div>
            <div className="mt-3">
                <Pagination
                    totalPages={apiData.pages}
                    onChangePage={onPageChange}
                    currentPage={filters?.page ?? DEFAULT.page}
                />
            </div>
        </PageTitle>
    );
}
