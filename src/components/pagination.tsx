import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";


interface PaginationProps {
    showNav?: boolean;
    totalPages: number;
    currentPage: number;
    maxVisible?: number;
    isDisabled?: boolean;
    onChangePage: (page: number) => void;
}


export const Pagination = (props: PaginationProps) => {
    const { currentPage, totalPages, onChangePage, isDisabled, showNav = true, maxVisible = 8 } = props;

    if (totalPages <= 1) {
        return null;
    }

    const safePage = Math.max(1, Math.min(currentPage, totalPages));

    const generatePages = (): ("..." | number)[] => {
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const siblingCount = Math.floor((maxVisible - 5) / 2);

        // Case 1 - Start. e.g., [1, 2, 3, 4, ..., 10]
        if (safePage < 3 + siblingCount) {
            const leftRange = Array.from({ length: maxVisible - 2 }, (_, i) => i + 1);
            return [...leftRange, "...", totalPages];
        }

        // Case 2 - End. e.g., [1, ..., 7, 8, 9, 10]
        if (safePage > totalPages - (2 + siblingCount)) {
            const rightRange = Array.from({ length: maxVisible - 2 }, (_, i) => totalPages - (maxVisible - 3) + i);
            return [1, "...", ...rightRange];
        }

        // Case 3 - Middle. e.g., [1, ..., 4, 5, 6, ..., 10]
        const middleRangeStart = safePage - siblingCount;
        const middleRangeEnd = safePage + siblingCount;
        const middleRange = Array.from({ length: middleRangeEnd - middleRangeStart + 1 }, (_, i) => middleRangeStart + i);

        return [1, "...", ...middleRange, "...", totalPages];
    };

    const pages = generatePages();
    const canGoPrevious = safePage > 1;
    const canGoNext = safePage < totalPages;

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onChangePage(page);
        }
    };

    return (
        <nav className="flex justify-center items-center mt-8" aria-label="Pagination navigation">
            <ul className="flex items-center gap-2">
                {showNav &&
                    <li>
                        <Button
                            size="sm"
                            disabled={!canGoPrevious}
                            aria-label="Go to previous page"
                            variant={canGoPrevious ? "secondary" : "ghost"}
                            onClick={() => handlePageChange(safePage - 1)}
                        >
                            <ChevronLeft className="size-5"/>
                        </Button>
                    </li>
                }
                {pages.map((page, idx) =>
                    <li key={`${page}-${idx}`}>
                        {page === "..." ?
                            <span className="px-3 py-2 text-sm text-muted-foreground" aria-hidden="true">...</span>
                            :
                            <Button
                                size="sm"
                                aria-label={`Go to page ${page}`}
                                onClick={() => handlePageChange(page)}
                                variant={page === safePage ? "default" : "ghost"}
                                aria-current={page === safePage ? "page" : undefined}
                            >
                                {page}
                            </Button>
                        }
                    </li>
                )}
                {showNav &&
                    <li>
                        <Button
                            size="sm"
                            aria-label="Go to next page"
                            disabled={!canGoNext || isDisabled}
                            variant={canGoNext ? "secondary" : "ghost"}
                            onClick={() => handlePageChange(safePage + 1)}
                        >
                            <ChevronRight className="size-5"/>
                        </Button>
                    </li>
                }
            </ul>
        </nav>
    );
};
