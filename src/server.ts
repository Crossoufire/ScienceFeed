import dotenv from "dotenv";
import {createRouter} from "@/router";
// import {seedDatabaseWithRssFeeds} from "@/server/utils/seed-database";
import {createStartHandler, defaultStreamHandler} from "@tanstack/react-start/server";


if (process.env.NODE_ENV === "development") {
    dotenv.config({ path: ".env", quiet: true });
}


export default createStartHandler({ createRouter })(defaultStreamHandler);


// void seedDatabaseWithRssFeeds();
