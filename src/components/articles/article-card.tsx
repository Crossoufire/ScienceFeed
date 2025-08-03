import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {cn, formatDateTime} from "@/lib/utils";
import {UserArticle} from "@/server/types/types";
import {Checkbox} from "@/components/ui/checkbox";
import {Archive, Info, Trash2} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";


interface ArticleCardProps {
    isEditing: boolean,
    selected: number[],
    article: UserArticle,
    onSelectionClick: (articleId: number) => void,
    onDeleteClick: (articleIds: number[]) => void,
    onArchiveClick: (articleIds: number[]) => void,
}


export const ArticleCard = ({ article, isEditing, selected, onSelectionClick, onArchiveClick, onDeleteClick }: ArticleCardProps) => {
    return (
        <Card
            onClick={() => onSelectionClick(article.id)}
            className={cn("relative pb-0 bg-cyan-950 max-sm:w-full flex flex-col", isEditing && "cursor-pointer")}
        >
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
                    {/*//@ts-expect-error - Need to add keywords per article */}
                    {article?.keywords?.map((keyword: any) => (
                        <Badge key={keyword} variant="outline" className="text-xs bg-background">
                            {keyword}
                        </Badge>
                    ))}
                </div>
                <div className="text-sm flex items-center flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => onArchiveClick([article.id])} disabled={isEditing} title="Archive">
                        <Archive className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDeleteClick([article.id])} disabled={isEditing} title="Delete">
                        <Trash2 className="h-4 w-4"/>
                    </Button>
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