import {cleanupDeletedArticles} from "@/lib/server/functions/cleanup";


const retentionDays = Number.parseInt(process.env.DELETED_ARTICLE_RETENTION_DAYS ?? "180", 10);
const result = await cleanupDeletedArticles(Number.isFinite(retentionDays) ? retentionDays : 180);

console.log(`Deleted ${result.deletedUserArticles} soft-deleted user article(s) older than ${result.retentionDays} days.`);
console.log(`Deleted ${result.deletedOrphanArticles} orphan article(s) with no user article references.`);
