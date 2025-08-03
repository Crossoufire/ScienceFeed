import {twMerge} from "tailwind-merge";
import {type ClassValue, clsx} from "clsx";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


interface FormatDateTimeOptions {
    onlyYear?: boolean;
    useLocalTz?: boolean;
    includeTime?: boolean;
}


export const formatDateTime = (dateInput: string | number | null | undefined, options: FormatDateTimeOptions = {}) => {
    if (!dateInput) return "-";

    let date = new Date(dateInput);
    if (typeof dateInput === "number" && dateInput.toString().length === 10) {
        date = new Date(dateInput * 1000);
    }

    if (isNaN(date.getTime())) return "-";

    const formatOptions: Intl.DateTimeFormatOptions = {
        timeZone: options.useLocalTz ? new Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
        year: "numeric",
        month: options.onlyYear ? undefined : "short",
        day: options.onlyYear ? undefined : "numeric",
        hour: options.includeTime ? "numeric" : undefined,
        minute: options.includeTime ? "numeric" : undefined,
        hour12: false,
    };

    if (options.onlyYear) {
        return date.toLocaleString("en-En", { timeZone: formatOptions.timeZone, year: "numeric" });
    }

    return new Intl.DateTimeFormat("en-En", formatOptions).format(date);
};
