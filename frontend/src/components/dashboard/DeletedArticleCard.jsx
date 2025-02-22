import {Info, Redo2} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {formatDateTime} from "@/utils/functions";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";


export const DeletedArticleCard = ({ article, onDeleteClick }) => {
    return (
        <Card className="relative bg-cyan-950 max-sm:w-full flex flex-col h-[230px]">
            <div className="flex items-center gap-2">
                <div className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <a target="_blank" rel="noopener noreferrer" href={article.link}
                               className="line-clamp-2 hover:underline" title={article.title}>
                                {article.title}
                            </a>
                        </CardTitle>
                        <CardDescription>
                            <div className="font-medium">
                                {article.publisher} - {article.journal}
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="-ml-1 text-sm mb-2 line-clamp-3">
                            {article.summary}
                        </div>
                    </CardContent>
                </div>
            </div>
            <div className="mt-auto flex items-center justify-between pb-3 px-3">
                <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs bg-background">
                            {keyword}
                        </Badge>
                    ))}
                </div>
                <div className="text-sm flex items-center flex-wrap gap-3">
                    <Button variant="green" size="sm" onClick={() => onDeleteClick([article.id])} title="Delete">
                        <Redo2 className="h-4 w-4"/> Restore
                    </Button>
                    <Popover>
                        <PopoverTrigger>
                            <Info className="w-4 h-4"/>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px]" align="end">
                            <div>Added: {formatDateTime(article.added_date, { includeTime: true })}</div>
                            <div>Deleted: {formatDateTime(article.delete_date, { includeTime: true })}</div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </Card>
    );
};
