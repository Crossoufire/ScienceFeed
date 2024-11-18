import {clsx} from "clsx";
import {twMerge} from "tailwind-merge";


export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};


export const formatDateTime = (dateInput, options = {}) => {
    if (!dateInput) {
        return "--";
    }

    let date;
    if (typeof dateInput === "number" && dateInput.toString().length === 10) {
        date = new Date(dateInput * 1000);
    }
    else {
        date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
        return "--";
    }

    const formatOptions = {
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
