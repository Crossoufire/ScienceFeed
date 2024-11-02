import {cn, formatDateTime} from "@/utils/functions";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {LuArchive, LuBook, LuCheckCircle, LuTrash2} from "react-icons/lu";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";


export const ArticleCard = (props) => {
    const { article, isEditing, isDisabled, selected, onSelectionClick, onArchiveClick, onDeleteClick, onReadClick } = props;
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
                        <div className="flex items-center flex-wrap gap-3">
                            <div>{formatDateTime(article.added_date)}</div>
                            <Button
                                size="sm"
                                disabled={isDisabled || isEditing}
                                variant={article.is_read ? "secondary" : "default"}
                                onClick={() => onReadClick([article.id], !article.is_read)}
                            >
                                {article.is_read ?
                                    <><LuCheckCircle className="mr-2 h-4 w-4 text-green-700"/> Read</>
                                    :
                                    <><LuBook className="mr-2 h-4 w-4"/> Mark as Read</>
                                }
                            </Button>
                            <Button variant="warning" size="sm" onClick={() => onArchiveClick([article.id])} disabled={isDisabled || isEditing}>
                                <LuArchive className="mr-2 h-4 w-4"/> Archive
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onDeleteClick([article.id])} disabled={isDisabled || isEditing}>
                                <LuTrash2 className="mr-2 h-4 w-4"/> Delete
                            </Button>
                        </div>
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
};