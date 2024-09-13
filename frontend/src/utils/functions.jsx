import {clsx} from "clsx";
import {twMerge} from "tailwind-merge";


export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};

export const sliceIntoParts = (arr, n) => {
    const len = arr.length;
    const partSize = Math.floor(len / n);
    const remainder = len % n;

    const result = [];
    let start = 0;

    for (let i = 0; i < n; i++) {
        const end = start + partSize + (i < remainder ? 1 : 0);
        result.push(arr.slice(start, end));
        start = end;
    }

    return result;
};

export const getLangCountryName = (name, type) => {
    let languageNames = new Intl.DisplayNames(["en"], { type });
    if (name === "cn") return "Chinese";
    return languageNames.of(name);
};

export const zeroPad = (value) => {
    if (value) return String(value).padStart(2, "0");
    return "00";
};

export const capitalize = (str) => {
    if (str) return str.charAt(0).toUpperCase() + str.slice(1);
    return str;
};

export const formatNumberWithSpaces = (value) => {
    if (value < 10000) return value;
    return value.toLocaleString().replace(/,/g, " ");
};

export const formatMinutes = (minutes, options = {}) => {
    if (isNaN(minutes) || !minutes) {
        return "--";
    }

    const conversions = {
        hours: 60,
        days: 1440,
    };

    if (options.to && conversions[options.to]) {
        const divisor = conversions[options.to];
        const result = minutes / divisor;
        return options.asInt ? Math.floor(result) : result;
    }

    if (options.format === "hm") {
        let hours = Math.floor(minutes / 60);
        let remainingMinutes = minutes % 60;

        if (options.onlyHours) {
            return `${String(hours).padStart(2, "0")} h`;
        }

        return `${String(hours).padStart(2, "0")} h ${String(Math.floor(remainingMinutes)).padStart(2, "0")}`;
    }

    return minutes;
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

export function downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function jsonToCsv(items) {
    if (!items || !items.length) return "";
    const header = Object.keys(items[0]);
    const headerString = header.join(",");
    const replacer = (key, value) => value ?? "";
    const rowItems = items.map(row =>
        header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(",")
    );
    return [headerString, ...rowItems].join("\r\n");
}
