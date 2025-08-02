import z from "zod";
import {authOptions, rssManagerOptions, userKeywordsOptions} from "@/lib/react-query";


export type CurrentUser = ReturnType<typeof authOptions>["queryFn"];
export type UserKeyword = Awaited<ReturnType<NonNullable<ReturnType<typeof userKeywordsOptions>["queryFn"]>>>[0];
export type UserRssFeeds = Awaited<ReturnType<NonNullable<ReturnType<typeof rssManagerOptions>["queryFn"]>>>;
export type UserRssFeed = UserRssFeeds[0];


export const generalSettingsSchema = z.object({
    name: z.string(),
    sendFeedEmails: z.boolean(),
    maxArticlesPerEmail: z.number(),
});


export type GeneralSettings = z.infer<typeof generalSettingsSchema>;