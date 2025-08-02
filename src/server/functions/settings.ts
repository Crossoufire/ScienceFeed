import {createServerFn} from "@tanstack/react-start";
import {generalSettingsSchema} from "@/server/types/types";
import {authMiddleware} from "@/server/middlewares/authentication";


export const postGeneralSettings = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .validator(generalSettingsSchema)
    .handler(async ({ data, context: { currentUser } }) => {

    })
