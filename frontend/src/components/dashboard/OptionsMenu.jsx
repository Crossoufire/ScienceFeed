import {useAuth} from "@/hooks/AuthHook";
import {LuFileEdit} from "react-icons/lu";
import {Button} from "@/components/ui/button";
import {Tooltip} from "@/components/ui/tooltip";
import {formatDateTime} from "@/utils/functions";


export const OptionsMenu = ({ isEditing, onEditModeClick, isDisabled, onRssFetcherClick }) => {
    const { currentUser } = useAuth();
    const lastRssUpdate = formatDateTime(currentUser?.last_rss_update, { includeTime: true, useLocalTz: true }) || "Never";

    return (
        <div className="flex items-center gap-3">
            <Button size="sm" onClick={onEditModeClick} variant="outline" disabled={isDisabled}>
                <LuFileEdit className="mr-2"/> {isEditing ? "Exit Bulk Mode" : "Bulk Edit"}
            </Button>
            <Tooltip text={`Last update: ${lastRssUpdate}.`} subText="Max every 5 minutes." side="left">
                <Button size="sm" variant="outline" onClick={onRssFetcherClick} disabled={isDisabled || isEditing}>
                    Update RSS Feeds
                </Button>
            </Tooltip>
        </div>
    );
};