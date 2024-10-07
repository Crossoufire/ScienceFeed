import {useState} from "react";
import {Button} from "@/components/ui/button";


export const EditionButtons = ({ isDisabled, selected, onBulkActionClick }) => {
    const [selectAll, setSelectAll] = useState(true);

    const handleSelectAction = () => {
        selectAll ? onBulkActionClick("select") : onBulkActionClick("deselect");
        setSelectAll(!selectAll);
    };

    return (
        <div className="flex items-center justify-end gap-4 mt-4">
            <Button size="sm" onClick={handleSelectAction} disabled={isDisabled}>
                {selectAll ? "Select All" : "Deselect All"}
            </Button>
            <Button size="sm" onClick={() => onBulkActionClick("read")}
                    disabled={selected.length === 0 || isDisabled}>
                Read Selected
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onBulkActionClick("unread")}
                    disabled={selected.length === 0 || isDisabled}>
                Unread Selected
            </Button>
            <Button size="sm" variant="warning" onClick={() => onBulkActionClick("archive")}
                    disabled={selected.length === 0 || isDisabled}>
                Archive Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onBulkActionClick("delete")}
                    disabled={selected.length === 0 || isDisabled}>
                Delete Selected
            </Button>
        </div>
    );
};