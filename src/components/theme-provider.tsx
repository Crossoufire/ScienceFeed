import {ScriptOnce} from "@tanstack/react-router";
import React, {createContext, use, useCallback, useEffect, useMemo, useState} from "react";


type Theme = "dark" | "light" | "system";
const MEDIA = "(prefers-color-scheme: dark)";


type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};


type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};


const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};


const ThemeProviderContext = createContext<ThemeProviderState>(initialState);


export function ThemeProvider({ children, defaultTheme = "system", storageKey = "theme", ...props }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() =>
        (typeof window === "undefined" ? null : (localStorage.getItem(storageKey) as Theme)) || defaultTheme,
    );

    const handleMediaQuery = useCallback(
        (e: MediaQueryListEvent | MediaQueryList) => {
            if (theme !== "system") return;

            const root = window.document.documentElement;
            const targetTheme = e.matches ? "dark" : "light";

            if (!root.classList.contains(targetTheme)) {
                root.classList.remove("light", "dark");
                root.classList.add(targetTheme);
            }
        },
        [theme],
    );

    // Listen for system preference changes
    useEffect(() => {
        const media = window.matchMedia(MEDIA);

        media.addEventListener("change", handleMediaQuery);
        handleMediaQuery(media);

        return () => media.removeEventListener("change", handleMediaQuery);
    }, [handleMediaQuery]);

    useEffect(() => {
        const root = window.document.documentElement;

        let targetTheme: string;

        if (theme === "system") {
            localStorage.removeItem(storageKey);
            targetTheme = window.matchMedia(MEDIA).matches ? "dark" : "light";
        }
        else {
            localStorage.setItem(storageKey, theme);
            targetTheme = theme;
        }

        // Only update if target theme is not already applied
        if (!root.classList.contains(targetTheme)) {
            root.classList.remove("light", "dark");
            root.classList.add(targetTheme);
        }
    }, [theme, storageKey]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeProviderContext {...props} value={value}>
            <ScriptOnce>
                {/* Apply theme early to avoid FOUC */}
                {`document.documentElement.classList.toggle(
            'dark',
            localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
            )`}
            </ScriptOnce>
            {children}
        </ThemeProviderContext>
    );
}


export const useTheme = () => {
    const context = use(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
