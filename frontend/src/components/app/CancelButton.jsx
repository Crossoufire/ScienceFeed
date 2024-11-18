import {toast} from "sonner";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {useDeleteArticles} from "@/api/mutations";


export const CancelButton = ({ duration, filters, articleIds }) => {
    const deleteArticles = useDeleteArticles(filters);
    const [progress, setProgress] = useState(100);

    const handleUndoClick = () => {
        deleteArticles.mutate({ articleIds, isDeleted: false }, {
            onError: () => toast.error("Failed to undo the article(s) deletion"),
            onSuccess: () => {
                toast.dismiss();
                toast.success("Article(s) restored");
            },
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress > 0) {
                    return prevProgress - (100 / (duration / 100));
                }
                clearInterval(interval);
                return 0;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [duration]);

    return (
        <div className="relative ml-2">
            <Button size="xs" onClick={() => handleUndoClick()} disabled={deleteArticles.isPending}>
                Undo
            </Button>
            <div className="absolute bottom-0 left-0 right-0 h-1 w-full">
                <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear rounded-md"
                />
            </div>
        </div>
    );
};