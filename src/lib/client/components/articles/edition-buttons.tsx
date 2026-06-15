import {type ComponentProps, useState} from "react";
import {ArticleBulkActions} from "@/lib/types/types";
import {Button} from "@/lib/client/components/ui/button";


interface EditionButtonsProps {
    selected: number[];
    onBulkActionClick: (action: ArticleBulkActions) => void;
    actions?: {
        label: string;
        action: ArticleBulkActions;
        variant?: ComponentProps<typeof Button>["variant"];
    }[];
}


export const EditionButtons = ({ selected, actions = defaultActions, onBulkActionClick }: EditionButtonsProps) => {
    const [selectAll, setSelectAll] = useState(true);

    const handleSelectAction = () => {
        if (selectAll) onBulkActionClick("select")
        else onBulkActionClick("deselect")

        setSelectAll(!selectAll);
    };

    return (
        <div className="flex items-center justify-end gap-4 mt-4">
            <Button size="sm" onClick={handleSelectAction}>
                {selectAll ? "Select All" : "Deselect All"}
            </Button>
            {actions.map((action) =>
                <Button
                    size="sm"
                    key={action.action}
                    variant={action.variant}
                    disabled={selected.length === 0}
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
