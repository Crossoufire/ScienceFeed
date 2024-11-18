import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useSearch} from "@tanstack/react-router";
import {Checkbox} from "@/components/ui/checkbox";
import {cn, formatDateTime} from "@/utils/functions";
import {Archive, Book, CheckCircle, Info, Trash2} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";


export const ArticleCard = (props) => {
    const { article, isEditing, isDisabled, selected, onSelectionClick, onArchiveClick, onDeleteClick, onReadClick } = props;
    const filters = useSearch({ strict: false });
    const isRead = article.is_read ? "bg-card" : "bg-cyan-950";

    return (
        <Card onClick={() => onSelectionClick(article.id)} className={cn(`relative ${isRead} max-sm:w-full`, isEditing && "cursor-pointer")}>
            {(isDisabled && selected.includes(article.id)) &&
                <div className="z-10 absolute h-full w-full top-[50%] left-[50%] transform -translate-x-1/2 flex
                -translate-y-1/2 justify-center items-center bg-black opacity-80 rounded-md"/>
            }
            <div className="flex items-center gap-2">
                {isEditing &&
                    <div className="ml-3">
                        <Checkbox checked={selected.includes(article.id)}/>
                    </div>
                }
                <div className="w-full">
                    <CardHeader>
                        <CardTitle>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={(isEditing || isDisabled) ? null : article.link}
                                className={cn(!isEditing && "hover:underline")}
                            >
                                {article.title}
                            </a>
                        </CardTitle>
                        <CardDescription>{article.publisher} - {article.journal}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="px-4 text-sm mb-2">{article.summary}</p>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2 justify-between">
                        <div className="flex flex-wrap gap-2">
                            {article.keywords.map(keyword =>
                                <Badge key={keyword} variant="outline" className="text-xs bg-background">
                                    {keyword}
                                </Badge>
                            )}
                        </div>
                        <div className="text-sm flex items-center flex-wrap gap-3">
                            {!filters?.show_archived &&
                                <Button
                                    size="sm"
                                    disabled={isDisabled || isEditing}
                                    variant={article.is_read ? "secondary" : "default"}
                                    onClick={() => onReadClick([article.id], !article.is_read)}
                                >
                                    {article.is_read ?
                                        <><CheckCircle className="mr-2 h-4 w-4 text-green-700"/> Read</>
                                        :
                                        <><Book className="mr-2 h-4 w-4"/> Mark as Read</>
                                    }
                                </Button>
                            }
                            <Button variant="warning" size="sm" onClick={() => onArchiveClick([article.id])} disabled={isDisabled || isEditing}>
                                <Archive className="mr-2 h-4 w-4"/>
                                {filters?.show_archived ? "Un-archive" : "Archive"}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onDeleteClick([article.id])} disabled={isDisabled || isEditing}>
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </Button>
                            <Popover>
                                <PopoverTrigger>
                                    <Info className="w-4 h-4"/>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px]" align="end">
                                    <div>Added: {formatDateTime(article.added_date, { includeTime: true })}</div>
                                    <div>Read: {formatDateTime(article.read_date, { includeTime: true })}</div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
};