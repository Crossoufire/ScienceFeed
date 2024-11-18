import {useState} from "react";
import {cn} from "@/utils/functions";
import {TriangleAlert, X} from "lucide-react";


export const FormError = ({ message, className }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn("bg-rose-500/10 p-3 rounded-md flex items-center gap-x-2 text-sm text-neutral-200", className)}>
            <TriangleAlert className="h-4 w-4"/>
            <p>{message}</p>
            <div role="button" onClick={handleDismiss} className="ml-auto">
                <X className="h-4 w-4"/>
            </div>
        </div>
    );
};
