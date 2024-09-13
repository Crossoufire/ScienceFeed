import {toast} from "sonner";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {queryClient} from "@/api/queryClient";
import {simpleMutations} from "@/api/mutations";
import {keywordsOptions} from "@/api/queryOptions";
import {createFileRoute} from "@tanstack/react-router";
import {useSuspenseQuery} from "@tanstack/react-query";
import {PageTitle} from "@/components/app/base/PageTitle";
import {LuPauseCircle, LuPlayCircle, LuPlus, LuTrash2} from "react-icons/lu";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";


// noinspection JSCheckFunctionSignatures
export const Route = createFileRoute("/_private/keywords")({
    component: KeywordManagerPage,
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(keywordsOptions()),
});


function KeywordManagerPage() {
    const keywords = useSuspenseQuery(keywordsOptions()).data;
    const [newKeyword, setNewKeyword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { addKeyword, deleteKeyword, toggleKeyword } = simpleMutations();

    const handleAddNewKeyword = () => {
        if (newKeyword.trim() === "") {
            return setErrorMessage("Keyword cannot be empty");
        }

        if (keywords.some(k => k.name === newKeyword.trim())) {
            return setErrorMessage("Keyword already exists");
        }

        addKeyword.mutate({ name: newKeyword.trim() }, {
            onError: () => toast.error("Failed to add new keyword"),
            onSuccess: async () => {
                setNewKeyword("");
                await queryClient.invalidateQueries({ queryKey: ["keywords"] });
            },
        });
    };

    const handleDeleteKeyword = async (keyword) => {
        if (!confirm(`Are you sure, it will be removed from all articles (${keyword.count})`)) return;

        deleteKeyword.mutate({ keywordId: keyword.id }, {
            onError: () => toast.error("Failed to delete keyword"),
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ["keywords"] });
            },
        });
    };

    const handleToggleKeyword = async (keyword) => {
        if (!confirm(`By deactivating this keyword, the associated articles will not be shown in your feed anymore. Do you want to continue?`)) return;

        toggleKeyword.mutate({ keywordId: keyword.id, active: !keyword.active }, {
            onError: () => toast.error("Failed to toggle the keyword"),
            onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ["keywords"] }),
        });
    };

    return (
        <PageTitle title="Keyword Manager" subtitle="Manage your keywords.">
            <div className="mt-6">
                <div className="flex items-center gap-3 max-sm:w-full w-[350px]">
                    <Input
                        value={newKeyword}
                        placeholder="Enter a new keyword"
                        onChange={(ev) => setNewKeyword(ev.target.value)}
                        onKeyPress={(ev) => {
                            if (ev.key === "Enter") handleAddNewKeyword();
                        }}
                    />
                    <Button size="sm" onClick={handleAddNewKeyword} disabled={addKeyword.isPending}>
                        <LuPlus className="mr-2 h-4 w-4"/> Add Keyword
                    </Button>
                </div>
                {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            </div>
            <Table className="mt-8">
                <TableHeader>
                    <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Total Articles</TableHead>
                        <TableHead>Read Articles</TableHead>
                        <TableHead>Archived Articles</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {keywords.map(keyword =>
                        <TableRow key={keyword.id} className="text-base">
                            <TableCell>
                                <div className={keyword.active ? "text-green-500" : "text-amber-500"}>
                                    {keyword.name}
                                </div>
                            </TableCell>
                            <TableCell>{keyword.count}</TableCell>
                            <TableCell>{keyword.count_read}</TableCell>
                            <TableCell>{keyword.count_archived}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="sm"
                                        onClick={() => handleToggleKeyword(keyword)}
                                        title={keyword.active ? "Deactivate" : "Activate"}
                                        variant={keyword.active ? "warning" : "green"}
                                        className={!keyword.active && "bg-green-700"}
                                    >
                                        {keyword.active ? <LuPauseCircle className="h-4 w-4"/> : <LuPlayCircle className="h-4 w-4"/>}
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteKeyword(keyword)}>
                                        <LuTrash2 className="h-4 w-4"/>
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