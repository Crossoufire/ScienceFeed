import {FileEdit} from "lucide-react";
import {useAuth} from "@/hooks/AuthHook";
import {Button} from "@/components/ui/button";
import {Tooltip} from "@/components/ui/tooltip";
import {formatDateTime} from "@/utils/functions";
import {useSearch} from "@tanstack/react-router";


export const OptionsMenu = ({ isEditing, onEditModeClick, isDisabled, onRssFetcherClick, onShowArchive }) => {
    const { currentUser } = useAuth();
    const filters = useSearch({ strict: false });
    const lastRssUpdate = formatDateTime(currentUser?.last_rss_update, { includeTime: true, useLocalTz: true }) || "Never";

    return (
        <div className="flex items-center gap-3">
            <Button size="sm" onClick={onEditModeClick} variant="outline" disabled={isDisabled}>
                <FileEdit className="w-3.5 h-3.5 mr-2"/> {isEditing ? "Exit Bulk Mode" : "Bulk Edit"}
            </Button>
            <Tooltip text={`Last update: ${lastRssUpdate}.`} subText="Max every 5 minutes." side="top" align="end">
                <Button size="sm" variant="outline" onClick={onRssFetcherClick} disabled={isDisabled || isEditing}>
                    Update RSS Feeds
                </Button>
            </Tooltip>
            <Button size="sm" variant="outline" onClick={onShowArchive} disabled={isDisabled || isEditing}>
                {filters?.show_archived ? "Hide Archived Articles" : "Show Archived Articles"}
            </Button>
        </div>
    );
};