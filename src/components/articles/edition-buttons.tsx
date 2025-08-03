import {useState} from "react";
import {Button} from "@/components/ui/button";
import {ArticleBulkActions} from "@/server/types/types";


interface EditionButtonsProps {
    selected: number[];
    onBulkActionClick: (action: ArticleBulkActions) => void;
}


export const EditionButtons = ({ selected, onBulkActionClick }: EditionButtonsProps) => {
    const [selectAll, setSelectAll] = useState(true);

    const handleSelectAction = () => {
        if (selectAll) {
            onBulkActionClick("select")
        }
        else {
            onBulkActionClick("deselect")
        }
        setSelectAll(!selectAll);
    };

    return (
        <div className="flex items-center justify-end gap-4 mt-4">
            <Button size="sm" onClick={handleSelectAction}>
                {selectAll ? "Select All" : "Deselect All"}
            </Button>
            <Button size="sm" variant="warning" onClick={() => onBulkActionClick("archive")} disabled={selected.length === 0}>
                Archive Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onBulkActionClick("delete")} disabled={selected.length === 0}>
                Delete Selected
            </Button>
        </div>
    );
};