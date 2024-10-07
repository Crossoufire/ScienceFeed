import {cn} from "@/utils/functions";
import {Badge} from "@/components/ui/badge";


export const KeywordsBadges = ({ isDisabled, keywords, activeKeywordsIds, onKeywordClick }) => {
    const checkIfCanClick = (keywordId) => {
        if (isDisabled) return;
        onKeywordClick(keywordId);
    };

    return (
        <>
            {keywords.map(keyword =>
                <Badge
                    key={keyword.name}
                    onClick={() => checkIfCanClick(keyword.id)}
                    className={cn(isDisabled && "cursor-auto")}
                    variant={activeKeywordsIds.includes(keyword.id) ? "label" : "secondary"}
                >
                    {keyword.name}
                </Badge>
            )}
        </>
    );
};