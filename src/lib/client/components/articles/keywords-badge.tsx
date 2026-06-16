import {cn} from "@/lib/utils/utils";
import {Badge} from "@/lib/client/components/ui/badge";


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
                    variant="outline"
                    key={keyword.name}
                    onClick={() => checkIfCanClick(keyword.id)}
                    className={cn(
                        "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors",
                        activeKeywordsIds.includes(keyword.id)
                            ? "border-[#53605f] bg-[#2f3a39] text-[#f3f5f4] hover:bg-[#384544]"
                            : "border-[#343434] bg-[#222222] text-[#aeb6c2] hover:bg-[#2a2a2a] hover:text-white",
                        isDisabled && (activeKeywordsIds.includes(keyword.id)
                            ? "cursor-default opacity-60 hover:bg-[#2f3a39] hover:text-[#f3f5f4]"
                            : "cursor-default opacity-60 hover:bg-[#222222] hover:text-[#aeb6c2]"),
                    )}
                >
                    {keyword.name}
                </Badge>
            )}
        </>
    );
};
