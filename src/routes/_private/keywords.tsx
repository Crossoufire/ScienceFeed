import {toast} from "sonner";
import * as React from "react";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {UserKeyword} from "@/server/types/types";
import {PageTitle} from "@/components/page-title";
import {createFileRoute} from "@tanstack/react-router";
import {queryKeys, userKeywordsOptions} from "@/lib/react-query";
import {PauseCircle, PlayCircle, Plus, Trash2} from "lucide-react";
import {useQueryClient, useSuspenseQuery} from "@tanstack/react-query";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useAddKeywordMutation, useDeleteKeywordMutation, useToggleKeywordMutation} from "@/lib/react-query/mutations";


export const Route = createFileRoute("/_private/keywords")({
    component: KeywordManagerPage,
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(userKeywordsOptions()),
});


function KeywordManagerPage() {
    const queryClient = useQueryClient();
    const addKeywordMutation = useAddKeywordMutation();
    const deleteKeywordMutation = useDeleteKeywordMutation();
    const toggleKeywordMutation = useToggleKeywordMutation();
    const [newKeyword, setNewKeyword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const userKeywords = useSuspenseQuery(userKeywordsOptions()).data;

    const handleAddNewKeyword = () => {
        if (newKeyword.trim() === "") {
            return setErrorMessage("Keyword cannot be empty");
        }

        if (userKeywords.some((k) => k.name === newKeyword.trim())) {
            return setErrorMessage("Keyword name already exists");
        }

        addKeywordMutation.mutate({ data: { name: newKeyword.trim() } }, {
            onError: () => toast.error("Failed to add new keyword"),
            onSuccess: async () => {
                setNewKeyword("");
                await queryClient.invalidateQueries({ queryKey: queryKeys.userKeywordsKey() });
            },
        });
    };

    const handleDeleteKeyword = async (keyword: UserKeyword) => {
        if (!confirm(`Are you sure ? This keyword will be removed from (${keyword.totalArticles}) articles. All the articles that only have this keyword will also be deleted.`)) return;

        deleteKeywordMutation.mutate({ data: { keywordId: keyword.id } }, {
            onError: () => toast.error("Failed to delete keyword"),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.userKeywordsKey() }),
        });
    };

    const handleToggleKeyword = async (keyword: UserKeyword) => {
        if (keyword.active) {
            if (!confirm(`By deactivating this keyword, the associated articles will not be shown in your dashboard anymore. Do you want to continue?`)) return;
        }
        else {
            if (!confirm(`By activating this keyword, the associated articles will be shown in your dashboard. Do you want to continue?`)) return;
        }

        toggleKeywordMutation.mutate({ data: { keywordId: keyword.id, active: !keyword.active } }, {
            onError: () => toast.error("Failed to toggle the keyword"),
            onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.userKeywordsKey() }),
        });
    };

    return (
        <PageTitle title="Keyword Manager" subtitle="Manage your RSS keywords.">
            <div className="mt-4">
                <div className="flex items-center gap-3 max-sm:w-full w-[400px]">
                    <Input
                        value={newKeyword}
                        placeholder="Enter a new keyword"
                        onChange={(ev) => setNewKeyword(ev.target.value)}
                        onKeyDown={(ev) => (ev.key === "Enter") && handleAddNewKeyword()}
                    />
                    <Button size="sm" onClick={handleAddNewKeyword} disabled={addKeywordMutation.isPending}>
                        <Plus className="h-4 w-4"/> Add Keyword
                    </Button>
                </div>
                {errorMessage &&
                    <p className="text-destructive text-sm">
                        {errorMessage}
                    </p>
                }
            </div>
            <Table className="mt-6">
                <TableHeader>
                    <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Read</TableHead>
                        <TableHead>Archived</TableHead>
                        <TableHead>Deleted</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userKeywords.map((keyword) =>
                        <TableRow key={keyword.id} className="text-base">
                            <TableCell>
                                <div className={cn("font-semibold", keyword.active ? "text-green-500" : "text-amber-500")}>
                                    {keyword.name}
                                </div>
                            </TableCell>
                            <TableCell>{keyword.totalArticles}</TableCell>
                            <TableCell>{keyword.readArticles}</TableCell>
                            <TableCell>{keyword.archivedArticles}</TableCell>
                            <TableCell>{keyword.deletedArticles}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="sm"
                                        onClick={() => handleToggleKeyword(keyword)}
                                        variant={keyword.active ? "warning" : "green"}
                                        title={keyword.active ? "Deactivate" : "Activate"}
                                        className={keyword.active ? "" : "bg-green-700"}
                                    >
                                        {keyword.active ? <PauseCircle className="h-4 w-4"/> : <PlayCircle className="h-4 w-4"/>}
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteKeyword(keyword)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </PageTitle>
    );
}
