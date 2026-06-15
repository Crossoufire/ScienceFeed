import {serverEnv} from "@/env/server";
import {clientEnv} from "@/env/client";
import {betterAuth} from "better-auth";
import {db} from "@/lib/server/database/db";
import {createServerOnlyFn} from "@tanstack/react-start";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {tanstackStartCookies} from "better-auth/tanstack-start";


const getAuthConfig = createServerOnlyFn(() => betterAuth({
    baseURL: clientEnv.VITE_BASE_URL,
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    user: {
        additionalFields: {
            sendFeedEmails: {
                type: "boolean",
                defaultValue: true,
                returned: true,
                input: false,
            },
            maxArticlesPerEmail: {
                type: "number",
                defaultValue: 20,
                returned: true,
                input: false,
            },
            lastRssUpdate: {
                type: "string",
                defaultValue: null,
                returned: true,
                input: false,
            },
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    socialProviders: {
        google: {
            clientId: serverEnv.GOOGLE_CLIENT_ID,
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
        },
    },
    advanced: {
        cookiePrefix: "sf",
        database: {
            generateId: false,
        },
    },
    plugins: [tanstackStartCookies()],
}));


export const auth = getAuthConfig();
