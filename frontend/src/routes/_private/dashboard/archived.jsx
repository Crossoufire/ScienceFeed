import {toast} from "sonner";
import {useState} from "react";
import {PageTitle} from "@/components/app/PageTitle";
import {Pagination} from "@/components/app/Pagination";
import {useSuspenseQuery} from "@tanstack/react-query";
import {useDebounceCallback} from "@/hooks/DebounceHook";
import {dashboardArchivedOptions} from "@/api/queryOptions";
import {InputSearch} from "@/components/dashboard/InputSearch";
import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useArchiveArticles, useDeleteArticles,} from "@/api/mutations";
import {ArchivedArticleCard} from "@/components/dashboard/ArchivedArticleCard";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/dashboard/archived")({
    component: Archived,
    loaderDeps: ({ search }) => ({ search }),
    loader: ({ context: { queryClient }, deps: { search } }) => queryClient.ensureQueryData(dashboardArchivedOptions(search)),
});


const DEFAULT = { search: "", page: 1 };


function Archived() {
    const navigate = useNavigate();
    const filters = Route.useSearch();
    const apiData = useSuspenseQuery(dashboardArchivedOptions(filters)).data;
    const [searchQuery, setSearchQuery] = useState(filters?.q ?? "");
    const deleteArticlesMutation = useDeleteArticles(filters, "dashboard-archived");
    const archiveArticlesMutation = useArchiveArticles(filters, "dashboard-archived");

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

    const onArchiveClick = (articleIds) => {
        archiveArticlesMutation.mutate({ articleIds, archive: false }, {
            onError: () => toast.error(`Failed to un-archived the article(s)`),
        });
    };

    const onDeleteClick = (articleIds) => {
        deleteArticlesMutation.mutate({ articleIds, isDeleted: true }, {
            onError: () => toast.error("Failed to delete the article(s)"),
        });
    };

    useDebounceCallback(searchQuery, 350, fetchData, { ...filters, search: searchQuery, });

    return (
        <PageTitle
            title={`Archived Articles (${apiData.total})`}
            subtitle="Here are all your archived articles"
        >
            <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
                <InputSearch
                    search={searchQuery}
                    onResetClick={onResetClick}
                    onChange={(ev) => setSearchQuery(ev.target.value)}
                />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 h-full max-sm:grid-cols-1">
                {apiData.articles.map((article) => (
                    <ArchivedArticleCard
                        key={article.id}
                        article={article}
                        onDeleteClick={onDeleteClick}
                        onArchiveClick={onArchiveClick}
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
