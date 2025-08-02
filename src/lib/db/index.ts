import * as schema from "@/lib/db/schema";
import {drizzle} from "drizzle-orm/libsql";
import {createClient} from "@libsql/client";
import {serverOnly} from "@tanstack/react-start";


const client = createClient({ url: process.env.DATABASE_URL as string });
const getDatabase = serverOnly(() => drizzle({ client, schema, casing: "snake_case" }));

export const db = getDatabase();
