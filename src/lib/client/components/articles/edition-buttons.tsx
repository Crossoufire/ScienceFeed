import {type ComponentProps} from "react";
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
        variant?: ComponentProps<typeof Button>["variant"];
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
        <div className="flex flex-wrap items-center justify-end gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
                {selectedLabel}
            </div>
            <Button size="sm" onClick={handleSelectAction} disabled={!hasArticles || isPending}>
                {allVisibleSelected ? "Deselect All" : "Select All"}
            </Button>
            {actions.map((action) =>
                <Button
                    size="sm"
                    key={action.action}
                    variant={action.variant}
                    disabled={selected.length === 0 || isPending}
                    onClick={() => onBulkActionClick(action.action)}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
};


const defaultActions: NonNullable<EditionButtonsProps["actions"]> = [
    {
        action: "archive",
        variant: "warning",
        label: "Archive Selected"
    },
    {
        action: "delete",
        variant: "destructive",
        label: "Delete Selected"
    },
];
