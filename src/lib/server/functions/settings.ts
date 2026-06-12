import {createServerFn} from "@tanstack/react-start";
import {generalSettingsSchema} from "@/lib/types/types";
import {authMiddleware} from "@/lib/server/middlewares/authentication";


export const postGeneralSettings = createServerFn({ method: "POST" })
    .middleware([authMiddleware])
    .inputValidator(generalSettingsSchema)
    .handler(async ({ data, context: { currentUser } }) => {

    })
