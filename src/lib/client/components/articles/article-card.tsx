import {UserArticle} from "@/lib/types/types";
import {cn, formatDateTime} from "@/lib/utils/utils";
import {Badge} from "@/lib/client/components/ui/badge";
import {Button} from "@/lib/client/components/ui/button";
import {Checkbox} from "@/lib/client/components/ui/checkbox";
import {Archive, Info, RotateCcw, Trash2} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/lib/client/components/ui/tooltip";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/lib/client/components/ui/card";


interface ArticleCardProps {
    isEditing: boolean,
    selected: number[],
    article: UserArticle,
    deleteTitle?: string,
    archiveTitle?: string,
    showDeleteAction?: boolean,
    showArchiveAction?: boolean,
    archiveIcon?: "archive" | "restore",
    onSelectionClick: (articleId: number) => void,
    onDeleteClick: (articleIds: number[]) => void,
    onArchiveClick: (articleIds: number[]) => void,
}


export const ArticleCard = (props: ArticleCardProps) => {
    const {
        article,
        selected,
        isEditing,
        onDeleteClick,
        onArchiveClick,
        onSelectionClick,
        deleteTitle = "Delete",
        archiveIcon = "archive",
        archiveTitle = "Archive",
        showDeleteAction = true,
        showArchiveAction = true,
    } = props;
    const ArchiveIcon = archiveIcon === "restore" ? RotateCcw : Archive;

    const onCardClick = () => {
        if (isEditing) {
            onSelectionClick(article.id);
        }
    };

    return (
        <Card onClick={onCardClick} className={cn("relative pb-0 bg-cyan-950 max-sm:w-full flex flex-col", isEditing && "cursor-pointer")}>
            <div className="flex items-center gap-2">
                {isEditing &&
                    <div className="ml-3">
                        <Checkbox checked={selected.includes(article.id)}/>
                    </div>
                }
                <div className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <a target="_blank" rel="noopener noreferrer" href={isEditing ? undefined : article.link}
                               className={cn("line-clamp-2", !isEditing && "hover:underline")}>
                                {article.title}
                            </a>
                        </CardTitle>
                        <CardDescription>
                            <div className="font-medium">
                                {article.publisher} - {article.journal}
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-3">
                        <div className="text-sm line-clamp-3">
                            {article.summary}
                        </div>
                    </CardContent>
                </div>
            </div>
            <div className="mt-auto flex items-center justify-between pb-3 px-3">
                <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword) =>
                        <Badge key={keyword} variant="outline" className="text-xs bg-background">
                            {keyword}
                        </Badge>
                    )}
                </div>
                <div className="text-sm flex items-center flex-wrap gap-2">
                    {showArchiveAction &&
                        <Button
                            size="sm"
                            variant="outline"
                            title={archiveTitle}
                            disabled={isEditing}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                onArchiveClick([article.id]);
                            }}
                        >
                            <ArchiveIcon className="h-4 w-4"/>
                        </Button>
                    }
                    {showDeleteAction &&
                        <Button
                            size="sm"
                            variant="outline"
                            title={deleteTitle}
                            disabled={isEditing}
                            onClick={(ev) => {
                                ev.stopPropagation();
                                onDeleteClick([article.id]);
                            }}
                        >
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    }
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="w-4 h-4"/>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="font-semibold">
                            Added: {formatDateTime(article.addedDate, { includeTime: true, useLocalTz: true })}
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
};
