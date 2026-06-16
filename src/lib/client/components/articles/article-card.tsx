import {UserArticle} from "@/lib/types/types";
import {cn, formatDateTime} from "@/lib/utils/utils";
import {Card} from "@/lib/client/components/ui/card";
import {Badge} from "@/lib/client/components/ui/badge";
import {Button} from "@/lib/client/components/ui/button";
import {Checkbox} from "@/lib/client/components/ui/checkbox";
import {Archive, ExternalLink, RotateCcw, Trash2} from "lucide-react";


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
    const stateLabel = article.isDeleted ? "Deleted" : article.isArchived ? "Archived" : null;
    const stateDate = article.isDeleted ? article.markedAsDeletedDate : article.markedAsArchivedDate;
    const showActiveDot = !article.isDeleted && !article.isArchived;
    const footerDate = stateLabel && stateDate
        ? `${stateLabel} ${formatDateTime(stateDate, { useLocalTz: true })}`
        : `Added ${formatDateTime(article.addedDate, { useLocalTz: true })}`;

    const onCardClick = () => {
        if (isEditing) {
            onSelectionClick(article.id);
        }
    };

    return (
        <Card
            onClick={onCardClick}
            className={cn("relative max-sm:w-full gap-0 overflow-hidden rounded-xl border border-[#333333] bg-[#1b1b1b] " +
                "p-5 pb-4 text-white shadow-none transition-colors hover:border-[#444444]",
                isEditing && "cursor-pointer",
                selected.includes(article.id) && "border-[#d9d9d9]/70 bg-[#202020]",
            )}
        >
            {isEditing &&
                <div className="absolute left-4 top-4 z-10">
                    <Checkbox checked={selected.includes(article.id)}/>
                </div>
            }

            <div className={cn("flex min-w-0 items-start gap-3", isEditing && "pl-7")}>
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex min-w-0 items-center gap-2 text-xs">
                        {showActiveDot &&
                            <span className="size-2 shrink-0 rounded-full bg-[#e5e7eb]" aria-hidden="true"/>
                        }
                        <span className="truncate font-semibold text-white">
                            {article.journal}
                        </span>
                        {article.publisher &&
                            <>
                                <span className="text-[#777777]" aria-hidden="true">·</span>
                                <span className="truncate text-[#8f96a3]">
                                    {article.publisher}
                                </span>
                            </>
                        }
                    </div>
                    <h2 className="text-base font-semibold leading-snug text-white">
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={isEditing ? undefined : article.link}
                            className={cn("line-clamp-2", !isEditing && "hover:underline")}
                            onClick={(ev) => ev.stopPropagation()}
                        >
                            {article.title}
                        </a>
                    </h2>
                </div>

                <a
                    target="_blank"
                    title="Open article"
                    rel="noopener noreferrer"
                    href={isEditing ? undefined : article.link}
                    onClick={(ev) => ev.stopPropagation()}
                    className={cn(
                        "mt-11 shrink-0 rounded-md p-1 text-[#9ca3af] transition-colors hover:bg-white/5 hover:text-white",
                        isEditing && "pointer-events-none opacity-40",
                    )}
                >
                    <ExternalLink className="size-4"/>
                </a>
            </div>

            <p className="mt-5 line-clamp-3 text-sm leading-6 text-[#aeb6c2]">
                {article.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
                {article.keywords.map((keyword) =>
                    <Badge
                        key={keyword}
                        variant="secondary"
                        className="rounded-full border-0 bg-[#292929] px-2.5 py-0.5 text-[11px] font-medium text-white shadow-none"
                    >
                        {keyword}
                    </Badge>
                )}
            </div>

            <div className="mt-4 border-t border-[#303030] pt-4">
                <div className="flex items-center justify-between gap-4">
                    <span className="min-w-0 truncate text-xs text-[#9ba3af]">
                        {footerDate}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                        {showArchiveAction &&
                            <Button
                                size="icon"
                                variant="ghost"
                                title={archiveTitle}
                                disabled={isEditing}
                                className="size-8 text-[#9ca3af] hover:bg-white/5 hover:text-white"
                                onClick={(ev) => {
                                    ev.stopPropagation();
                                    onArchiveClick([article.id]);
                                }}
                            >
                                <ArchiveIcon className="size-4"/>
                            </Button>
                        }
                        {showDeleteAction &&
                            <Button
                                size="icon"
                                variant="ghost"
                                title={deleteTitle}
                                disabled={isEditing}
                                className="size-8 text-[#9ca3af] hover:bg-white/5 hover:text-white"
                                onClick={(ev) => {
                                    ev.stopPropagation();
                                    onDeleteClick([article.id]);
                                }}
                            >
                                <Trash2 className="size-4"/>
                            </Button>
                        }
                    </div>
                </div>
            </div>
        </Card>
    );
};
