import {useAuth} from "@/hooks/AuthHook";
import {FileEdit, Rss} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Tooltip} from "@/components/ui/tooltip";
import {formatDateTime} from "@/utils/functions";


export const OptionsMenu = ({ isEditing, onEditModeClick, onRssFetcherClick }) => {
    const { currentUser } = useAuth();
    const lastRssUpdate = formatDateTime(currentUser?.last_rss_update, { includeTime: true, useLocalTz: true }) || "Never";

    return (
        <div className="flex items-center gap-3">
            <Button size="sm" onClick={onEditModeClick} variant="outline">
                <FileEdit className="w-3.5 h-3.5 mr-2"/> {isEditing ? "Exit Bulk Mode" : "Bulk Edit"}
            </Button>
            <Tooltip text={`Last update: ${lastRssUpdate}.`} subText="Max every 5 minutes." side="top" align="end">
                <Button size="sm" variant="outline" onClick={onRssFetcherClick} disabled={isEditing}>
                    <Rss className="w-3.5 h-3.5 mr-2"/> Update Feeds
                </Button>
            </Tooltip>
        </div>
    );
};