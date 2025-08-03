import {XMLParser} from "fast-xml-parser";


export type RssItem = {
    link: string | null;
    title: string | null;
    description: string | null;
};

export async function parseRssFeed(url: string): Promise<RssItem[]> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch RSS feed. HTTP ${res.status} ${res.statusText}`);
    }

    const parser = new XMLParser({
        trimValues: true,
        processEntities: true,
        ignoreAttributes: true,
        attributeNamePrefix: "",
        cdataPropName: "__cdata",
    });

    const xml = await res.text();
    const doc = parser.parse(xml);

    let items: unknown = doc?.rss?.channel?.item ?? doc?.rdf?.item ?? doc?.channel?.item;
    if (!items && doc?.feed?.entry) items = doc.feed.entry;
    if (!items) return [];

    const arr = Array.isArray(items) ? items : [items];

    const toStringOrNull = (v: unknown) => {
        if (v == null) return null;
        if (typeof v === "string") return v;
        if (typeof v === "object") {
            const maybeCdata = (v as any).__cdata;
            if (typeof maybeCdata === "string") return maybeCdata;
            const maybeText = (v as any)["#text"];
            if (typeof maybeText === "string") return maybeText;
        }
        return String(v);
    };

    const extractLink = (item: any): string | null => {
        if (item.link != null) {
            const linkVal = item.link;
            if (typeof linkVal === "string") return linkVal;
            if (Array.isArray(linkVal)) {
                const first = linkVal[0];
                if (typeof first === "string") return first;
                if (first && typeof first.href === "string") return first.href;
            }
            else if (linkVal && typeof linkVal.href === "string") {
                return linkVal.href;
            }
            const asText = toStringOrNull(linkVal);
            if (asText) return asText;
        }

        if (item.link == null && item.href) return String(item.href);

        const links = item.link;
        if (Array.isArray(links)) {
            const alt = links.find((l: any) => typeof l === "object" && l.rel === "alternate" && l.href);
            if (alt?.href) return String(alt.href);
            const firstHref = links.find((l: any) => typeof l === "object" && l.href);
            if (firstHref?.href) return String(firstHref.href);
            const firstString = links.find((l: any) => typeof l === "string");
            if (firstString) return String(firstString);
        }

        return null;
    };

    const extractDescription = (item: any): string | null => {
        if (item.description != null) {
            const d = toStringOrNull(item.description);
            if (d) return d;
        }
        const contentEncoded = item["content:encoded"] ?? item["contentEncoded"] ?? null;
        if (contentEncoded != null) {
            const c = toStringOrNull(contentEncoded);
            if (c) return c;
        }
        if (item.summary != null) {
            const s = toStringOrNull(item.summary);
            if (s) return s;
        }
        if (item.content != null) {
            const c = toStringOrNull(item.content);
            if (c) return c;
        }
        return null;
    };

    const result: RssItem[] = arr.map((item: any) => {
        const title = toStringOrNull(item.title) ?? null;
        const link = extractLink(item);
        const description = extractDescription(item);
        return { title, link, description };
    });

    return result;
}


export function findMatchingKeywordsRegex(keywords: string[], rssItem: RssItem): string[] {
    const escRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(${keywords.map((k) => escRegex(k.toLowerCase())).join("|")})`, "i");

    const findMatches = (text: string | null): Set<string> => {
        if (typeof text !== "string") {
            return new Set<string>();
        }

        const matches = new Set<string>();
        const lower = text.toLowerCase();
        const globalPattern = new RegExp(pattern.source, pattern.flags + "g");

        let m: RegExpExecArray | null;
        while ((m = globalPattern.exec(lower)) !== null) {
            matches.add(m[1]);
            if (m.index === globalPattern.lastIndex) {
                globalPattern.lastIndex++;
            }
        }
        return matches;
    };

    const result = new Set<string>();
    for (const value of Object.values(rssItem)) {
        for (const match of findMatches(value)) {
            result.add(match);
        }
    }

    return Array.from(result);
}


export function cleanHtmlWithRegex(html: string): string {
    const noScriptStyle = html.replace(/<(script|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, "");
    const noTags = noScriptStyle.replace(/<[^>]*?>/g, "");
    const cleanText = noTags.replace(/\s+/g, " ").trim();
    return cleanText;
}
