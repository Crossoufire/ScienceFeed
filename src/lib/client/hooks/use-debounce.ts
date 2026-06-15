import {useEffect, useRef, useState} from "react";


export const useDebounceCallback = <T>(value: unknown, delay: number, callback: (args: T) => void, args: T) => {
    const argsRef = useRef(args);
    const callbackRef = useRef(callback);
    const hasMountedRef = useRef(false);

    useEffect(() => {
        argsRef.current = args;
        callbackRef.current = callback;
    }, [callback, args]);

    useEffect(() => {
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            return;
        }

        const timer = setTimeout(() => callbackRef.current(argsRef.current), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
};


export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};
