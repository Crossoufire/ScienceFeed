import {createServerFn} from "@tanstack/react-start";
import {generalSettingsSchema} from "@/lib/schemas/schemas";
import {authMiddleware} from "@/lib/server/middlewares/authentication";


export const postGeneralSettings = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(generalSettingsSchema)
    .handler(async ({ data, context: { currentUser } }) => {

    })
