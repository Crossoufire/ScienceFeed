import {Config} from "drizzle-kit";
import {serverEnv} from "@/env/server";


export default {
    out: "./drizzle",
    schema: "./src/lib/server/database/schema/index.ts",
    strict: true,
    verbose: true,
    breakpoints: true,
    dialect: "sqlite",
    casing: "snake_case",
    dbCredentials: {
        url: serverEnv.DATABASE_URL,
    },
} satisfies Config;
