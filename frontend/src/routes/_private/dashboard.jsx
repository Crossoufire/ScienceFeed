import {toast} from "sonner";
import {useMemo, useState} from "react";
import {useAuth} from "@/hooks/AuthHook";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {queryClient} from "@/api/queryClient";
import {Button} from "@/components/ui/button";
import {Tooltip} from "@/components/ui/tooltip";
import {simpleMutations} from "@/api/mutations";
import {dashboardOptions} from "@/api/queryOptions";
import {cn, formatDateTime} from "@/utils/functions";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "@/components/app/base/PageTitle";
import {LuArchive, LuBook, LuCheckCircle, LuSearch, LuTrash2} from "react-icons/lu";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/dashboard")({
    component: Dashboard,
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(dashboardOptions()),
});


function Dashboard() {
    const { currentUser } = useAuth();
    const articles = useSuspenseQuery(dashboardOptions()).data;
    const [searchQuery, setSearchQuery] = useState("");
    const [activeKeywords, setActiveKeywords] = useState([]);
    const { articleRead, articleArchive, articleDelete, rssFetcher } = simpleMutations();
    const allKeywords = useMemo(() => Array.from(new Set(articles.flatMap(a => a.keywords))), [articles]);
    const lastRssUpdate = formatDateTime(currentUser.last_rss_update, { includeTime: true, useLocalTz: true }) || "Never";

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleKeywordToggle = (keyword) => {
        setActiveKeywords((prev) => prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]);
    };

    const handleToggleArticleRead = (article) => {
        const isRead = article.is_read ? "unread" : "read";

        articleRead.mutate({ articleId: article.id, read: !article.is_read }, {
            onError: () => toast.error(`Failed to mark the article as ${isRead}`),
            onSuccess: (data, variables) => {
                toast.success(`Article ${isRead}`);
                return queryClient.setQueryData(["dashboard"], (oldData) => {
                    return oldData.map(a => a.id === variables.articleId ? { ...a, is_read: variables.read } : a);
                });
            },
        });
    };

    const handleArchiveArticle = (article) => {
        const isArchived = article.is_archived ? "not-archived" : "archived";

        articleArchive.mutate({ articleId: article.id, archive: !article.is_archived }, {
            onError: () => toast.error(`Failed to mark the article as ${isArchived}`),
            onSuccess: (data, variables) => {
                queryClient.setQueryData(["dashboard"], (oldData) => {
                    if (!oldData) return oldData;
                    return oldData.filter(a => a.id !== variables.articleId);
                });
                toast.success(`Article ${isArchived}`);
            },
        });
    };

    const handleDeleteArticle = (article) => {
        articleDelete.mutate({ articleId: article.id }, {
            onError: () => toast.error("Failed to delete the article"),
            onSuccess: (data, variables) => {
                queryClient.setQueryData(["dashboard"], (oldData) => {
                    if (!oldData) return oldData;
                    return oldData.filter(a => a.id !== variables.articleId);
                });
                toast.success("Article deleted");
            },
        });
    };

    const runRssFetcher = () => {
        rssFetcher.mutate(undefined, {
            onError: () => toast.error("An error occurred while running the RSS Fetcher"),
            onSuccess: async (data) => {
                if (data) return toast.warning(data);
                toast.success("RSS Fetcher successfully finished");
                await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            },
        });
    };

    return (
        <PageTitle title="Articles From RSS Feed" subtitle="Manage Your Articles">
            <div className="flex items-center justify-between mt-5">
                <div className="relative w-[300px]">
                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="text"
                        className="pl-9"
                        value={searchQuery}
                        placeholder="Search articles..."
                        onChange={(ev) => handleSearch(ev.target.value)}
                    />
                </div>
                <Tooltip text={`Last update: ${lastRssUpdate}.\nYou can manually run it every 30 minutes.`} side="left">
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-[130px]"
                        onClick={runRssFetcher}
                        disabled={rssFetcher.isPending}
                    >
                        Run RSS Fetcher
                    </Button>
                </Tooltip>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
                {allKeywords.map(keyword =>
                    <Badge
                        key={keyword}
                        onClick={() => handleKeywordToggle(keyword)}
                        variant={activeKeywords.includes(keyword) ? "label" : "secondary"}
                    >
                        {keyword}
                    </Badge>
                )}
            </div>
            <div className="w-full mt-4 flex flex-col gap-4">
                {articles.map(article =>
                    <Card key={article.id} className={cn("max-sm:w-full", article.is_read ? "bg-card" : "bg-cyan-950")}>
                        <CardHeader>
                            <CardTitle>
                                <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {article.title}
                                </a>
                            </CardTitle>
                            <CardDescription>{article.publisher} - {article.journal}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">{article.summary}</p>
                        </CardContent>
                        <CardFooter className="flex flex-wrap gap-2 justify-between">
                            <div className="flex flex-wrap gap-2">
                                {article.keywords.map(keyword =>
                                    <Badge key={keyword} variant="outline" className="text-xs bg-background">
                                        {keyword}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center flex-wrap gap-3">
                                <Button
                                    size="sm"
                                    onClick={() => handleToggleArticleRead(article)}
                                    variant={article.is_read ? "secondary" : "default"}
                                    disabled={articleRead.isPending && article.id === articleRead.variables?.articleId}
                                >
                                    {article.is_read ?
                                        <><LuCheckCircle className="mr-2 h-4 w-4 text-green-700"/> Read</>
                                        :
                                        <><LuBook className="mr-2 h-4 w-4"/> Mark as Read</>
                                    }
                                </Button>
                                <Button variant="warning" size="sm" onClick={() => handleArchiveArticle(article)}
                                        disabled={articleArchive.isPending && article.id === articleArchive.variables?.articleId}>
                                    <LuArchive className="mr-2 h-4 w-4"/> Archive
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteArticle(article)}
                                        disabled={articleDelete.isPending && article.id === articleDelete.variables?.articleId}>
                                    <LuTrash2 className="mr-2 h-4 w-4"/> Delete
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </PageTitle>
    );
}
