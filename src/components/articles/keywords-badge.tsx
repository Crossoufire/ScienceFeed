import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";


interface KeywordsBadgeProps {
    isDisabled?: boolean;
    activeKeywordsIds: number[];
    onKeywordClick: (keywordId: number) => void;
    keywords: {
        id: number,
        name: string,
        active: boolean,
    }[];
}


export const KeywordsBadge = ({ isDisabled, keywords, activeKeywordsIds, onKeywordClick }: KeywordsBadgeProps) => {
    const checkIfCanClick = (keywordId: number) => {
        if (isDisabled) return;
        onKeywordClick(keywordId);
    };

    return (
        <>
            {keywords.map((keyword) =>
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