import {cn} from "@/lib/utils/utils";
import {ArticleBulkActions} from "@/lib/types/types";
import {Button} from "@/lib/client/components/ui/button";


interface EditionButtonsProps {
    selected: number[];
    isPending?: boolean;
    totalVisible: number;
    onBulkActionClick: (action: ArticleBulkActions) => void;
    actions?: {
        label: string;
        action: ArticleBulkActions;
    }[];
}


export const EditionButtons = ({ selected, totalVisible, isPending = false, actions = defaultActions, onBulkActionClick }: EditionButtonsProps) => {
    const hasArticles = totalVisible > 0;
    const allVisibleSelected = hasArticles && selected.length === totalVisible;
    const selectedLabel = hasArticles ? `${selected.length} / ${totalVisible} selected` : "0 selected";

    const handleSelectAction = () => {
        onBulkActionClick(allVisibleSelected ? "deselect" : "select");
    };

    return (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#303030] bg-[#181818] px-3 py-2">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#e5e7eb]">
                    Bulk edit
                </span>
                <span className="rounded-full border border-[#353535] bg-[#222222] px-2.5 py-1 text-xs text-[#aeb6c2]">
                    {selectedLabel}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSelectAction}
                    disabled={!hasArticles || isPending}
                    className="h-8 border border-[#363636] bg-[#222222] px-3 text-[#e5e7eb] hover:bg-[#2b2b2b] hover:text-white"
                >
                    {allVisibleSelected ? "Deselect All" : "Select All"}
                </Button>
                {actions.map((action) =>
                    <Button
                        size="sm"
                        variant="ghost"
                        key={action.action}
                        disabled={selected.length === 0 || isPending}
                        onClick={() => onBulkActionClick(action.action)}
                        className={cn(
                            "h-8 border border-[#363636] bg-transparent px-3 text-[#d8dee8] hover:bg-[#262626] hover:text-white",
                            action.action === "delete" && "text-[#e7b9b9] hover:bg-[#332424] hover:text-[#f4d6d6]",
                        )}
                    >
                        {action.label}
                    </Button>
                )}
            </div>
        </div>
    );
};


const defaultActions: NonNullable<EditionButtonsProps["actions"]> = [
    {
        action: "archive",
        label: "Archive Selected",
    },
    {
        action: "delete",
        label: "Delete Selected",
    },
];
