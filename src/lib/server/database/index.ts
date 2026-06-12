import {drizzle} from "drizzle-orm/libsql";
import {createClient} from "@libsql/client";
import * as schema from "@/lib/server/database/schema";
import {createServerOnlyFn} from "@tanstack/react-start";


const client = createClient({ url: process.env.DATABASE_URL as string });


const getDatabase = createServerOnlyFn(() => drizzle({ client, schema, casing: "snake_case" }));


export const db = getDatabase();
