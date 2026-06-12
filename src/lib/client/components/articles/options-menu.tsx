import {useAuth} from "@/lib/client/hooks/use-auth";
import {FileEdit, Rss} from "lucide-react";
import {formatDateTime} from "@/lib/utils/utils";
import {Button} from "@/lib/client/components/ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/lib/client/components/ui/tooltip";


interface OptionsMenuProps {
    isEditing: boolean;
    onEditModeClick: () => void;
    onRssFetcherClick: () => void;
}


export const OptionsMenu = ({ isEditing, onEditModeClick, onRssFetcherClick }: OptionsMenuProps) => {
    const { currentUser } = useAuth();
    const lastRssUpdate = formatDateTime(currentUser?.lastRssUpdate, { includeTime: true, useLocalTz: true });

    return (
        <div className="flex items-center gap-3">
            <Button size="sm" onClick={onEditModeClick} variant="outline">
                <FileEdit className="w-3.5 h-3.5 mr-1"/> {isEditing ? "Exit Bulk Mode" : "Bulk Edit"}
            </Button>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={onRssFetcherClick} disabled={isEditing}>
                        <Rss className="w-3.5 h-3.5 mr-1"/> Update Feeds
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="text-sm">
                    <div>{`Last update: ${lastRssUpdate}`}</div>
                    <div className="text-xs italic text-amber-800">Max every 30 minutes.</div>
                </TooltipContent>
            </Tooltip>
        </div>
    );
};