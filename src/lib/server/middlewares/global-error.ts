import z from "zod";
import {createMiddleware} from "@tanstack/react-start";
import {isNotFound, isRedirect} from "@tanstack/react-router";


/**
 * Error Types and Logic
 * redirect: thrown in code but returned and handled frontend side by tanstack router.
 * notFound: thrown in code but returned and handled frontend side by tanstack router.
 * Error: Unexpected Error anywhere, send admin email, return a generic error message.
 **/
export const funcErrorMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
    try {
        const results = await next();
        if ("error" in results && results.error !== undefined && !isRedirect(results.error) && !isNotFound(results.error)) {
            throw results.error;
        }
        return results;
    }
    catch (err: any) {
        if (process.env.NODE_ENV !== "production") {
            console.error("ServerFunc Error:", { err });
        }

        if (isRedirect(err) || isNotFound(err)) {
            throw err;
        }

        if (err instanceof z.ZodError) {
            throw new Error("A Validation error occurred. Please try again later.");
        }
        else {
            throw new Error("An Unexpected error occurred. Please try again later.");
        }
    }
});
