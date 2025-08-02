import {env} from "@/env/server";
import type {Config} from "drizzle-kit";


export default {
    out: "./drizzle",
    schema: "./src/lib/db/schema/index.ts",
    strict: true,
    verbose: true,
    breakpoints: true,
    dialect: "sqlite",
    casing: "snake_case",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
} satisfies Config;
