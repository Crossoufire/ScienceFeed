import * as z from "zod";
import {createEnv} from "@t3-oss/env-core";


export const serverEnv = createEnv({
    server: {
        // Database
        DATABASE_URL: z.string().default("./instance/site.db"),

        // Better-Auth
        BETTER_AUTH_SECRET: z.string().min(20),

        // OAuth2 Providers
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),

        // Admin Secrets
        ADMIN_MAIL_USERNAME: z.email(),
        ADMIN_MAIL_PASSWORD: z.string().min(8),
    },
    runtimeEnv: process.env,
});
