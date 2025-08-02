import {db} from "@/lib/db";
import {env} from "@/env/server";
import {betterAuth} from "better-auth";
import {serverOnly} from "@tanstack/react-start";
import {reactStartCookies} from "better-auth/react-start";
import {drizzleAdapter} from "better-auth/adapters/drizzle";


const getAuthConfig = serverOnly(() =>
    betterAuth({
        baseURL: env.VITE_BASE_URL,
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
                clientId: env.GOOGLE_CLIENT_ID!,
                clientSecret: env.GOOGLE_CLIENT_SECRET!,
            },
        },
        advanced: {
            cookiePrefix: "sf",
            database: {
                useNumberId: true,
            },
        },
        plugins: [reactStartCookies()],
    }),
);


export const auth = getAuthConfig();
