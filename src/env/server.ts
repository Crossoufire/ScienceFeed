import * as z from "zod";
import {createEnv} from "@t3-oss/env-core";


export const env = createEnv({
    server: {
        DATABASE_URL: z.url(),
        VITE_BASE_URL: z.url().default("http://localhost:3000"),

        BETTER_AUTH_SECRET: z.string().min(1),
        GOOGLE_CLIENT_ID: z.string().optional(),
        GOOGLE_CLIENT_SECRET: z.string().optional(),

        MAIL_USERNAME: z.email(),
        MAIL_PASSWORD: z.string().min(1),
    },
    runtimeEnv: process.env,
});
