import { outboundUrl } from "./platforms";
import { DEFAULT_TIME_ZONE } from "./zone";
import type { Category, Platform, Seller, Stream, StreamStatus } from "./types";

export type IndexedRoom = {
  platform: Platform;
  eventId: string;
  title: string;
  sellerName: string;
  sellerHandle?: string;
  shopHandle?: string;
  viewers?: number;
  tags: string[];
  startTime?: string;
  description?: string;
  state?: "LIVE" | "UPCOMING";
};

const EBAY_CHANNELS = ["explore", "FWmfQGrdorhkCRcS"];
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const GQL_HASH = "ceb9e085536155e925236493f6c8d5bd5c88f99114b999aedefe7aa1f3e28994";
const MODULE_ID = "module_90c47918-5eb6-11f1-95a9-07a497878345";
const TEMPLATE_ID = "template_b6e76d1f-8684-47ea-9c37-75f45ba09de2";

const extraSellers = new Map<string, Seller>();

export function registerIndexedSellers(sellers: Seller[]) {
  for (const seller of sellers) extraSellers.set(seller.slug, seller);
}

export function indexedSellerBySlug(slug: string) {
  return extraSellers.get(slug);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "seller";
}

function hue(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 360;
}

function zoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

function zonedDate(timeZone: string, year: number, month: number, day: number, hour: number, minute: number) {
  const utc = Date.UTC(year, month - 1, day, hour, minute);
  const shown = zoneParts(new Date(utc), timeZone);
  const shifted = Date.UTC(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
  return new Date(utc - (shifted - utc));
}

export function parseHubClock(label: string, clock = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const match = label.match(/^(Today|Tomorrow|[A-Za-z]{3}\s+\d{1,2}\s+[A-Za-z]{3}),\s*(\d{1,2}):(\d{2})$/i);
  if (!match) return undefined;
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const now = zoneParts(clock, timeZone);
  if (/^today$/i.test(match[1])) return zonedDate(timeZone, now.year, now.month, now.day, hour, minute).toISOString();
  if (/^tomorrow$/i.test(match[1])) {
    const tomorrow = new Date(clock);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const next = zoneParts(tomorrow, timeZone);
    return zonedDate(timeZone, next.year, next.month, next.day, hour, minute).toISOString();
  }
  const named = Date.parse(`${match[1]} ${now.year} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} UTC`);
  if (Number.isNaN(named)) return undefined;
  const parsed = new Date(named);
  return zonedDate(timeZone, parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate(), hour, minute).toISOString();
}

export function inferCategory(title: string, tags: string[] = []): Category {
  const hay = `${title} ${tags.join(" ")}`.toLowerCase();
  if (/pok[eé]mon|tcg|rip\s*&?\s*ship|holos?|slabs?/.test(hay) && !/football|nba|basketball/.test(hay)) return "pokemon";
  if (/football|premier league|soccer|topps chrome/.test(hay)) return "football-cards";
  if (/nba|basketball|lebron/.test(hay)) return "basketball-cards";
  if (/coin|bullion|sovereign|silver|stacking/.test(hay)) return "coins";
  if (/comic|marvel|dc comics/.test(hay)) return "comics";
  if (/sneaker|jordan|nike|adidas|dunk/.test(hay) && /shoe|trainer|sneaker|jordan/.test(hay)) return "sneakers";
  if (/watch|rolex|omega/.test(hay)) return "watches";
  if (/handbag|luxury|dior|gucci/.test(hay)) return "luxury";
  if (/jacket|apparel|fashion|y2k|wardrobe/.test(hay)) return "fashion";
  if (/phone|tech|console|laptop|electronics|iphone/.test(hay)) return "electronics";
  if (/vintage|90s|y2k/.test(hay)) return "vintage";
  if (/shirt|memorabilia|signed|match.?worn/.test(hay)) return "memorabilia";
  if (/sneaker|jordan|nike/.test(hay)) return "sneakers";
  return "electronics";
}

function walkEvents(node: unknown, rooms: IndexedRoom[] = []): IndexedRoom[] {
  if (!node || typeof node !== "object") return rooms;
  const value = node as Record<string, unknown>;
  if (value.__typename === "LiveEvent" && typeof value.liveEventId === "string") {
    const hosts = (value.hosts as Array<Record<string, unknown>> | undefined) ?? [];
    const host = hosts[0] ?? {};
    const profile = (host.sellerProfile as Record<string, unknown> | undefined)?.store as Record<string, unknown> | undefined;
    const tags = ((value.tags as Array<{ name?: string }> | undefined) ?? []).map((tag) => tag.name).filter(Boolean) as string[];
    rooms.push({
      platform: "ebay",
      eventId: value.liveEventId,
      title: String(value.title ?? "eBay Live"),
      sellerName: String(profile?.displayName || host.userAccountName || "eBay Live seller"),
      sellerHandle: typeof host.userAccountName === "string" ? host.userAccountName : undefined,
      shopHandle: typeof host.userAccountName === "string" ? host.userAccountName : undefined,
      viewers: typeof value.watchedCount === "number" ? value.watchedCount : undefined,
      tags,
      startTime: typeof value.startTime === "string" ? value.startTime : undefined,
      description: typeof value.description === "string" ? value.description : undefined,
      state: value.state === "UPCOMING" ? "UPCOMING" : "LIVE",
    });
  }
  for (const child of Object.values(value)) walkEvents(child, rooms);
  return rooms;
}

function parseEbayMarkdown(markdown: string, state: "LIVE" | "UPCOMING" = "LIVE"): IndexedRoom[] {
  const rooms = new Map<string, IndexedRoom>();
  const ids = [...markdown.matchAll(/ebaylive\/events\/([A-Za-z0-9]+)/g)].map((match) => match[1]);
  for (const eventId of ids) {
    if (rooms.has(eventId)) continue;
    const at = markdown.indexOf(`/events/${eventId}`);
    const before = markdown.slice(Math.max(0, at - 240), at);
    const window = markdown.slice(at, at + 900);
    const clock = window.match(/(Today|Tomorrow|[A-Za-z]{3}\s+\d{1,2}\s+[A-Za-z]{3}),\s*(\d{1,2}:\d{2})/i);
    const title =
      window.match(/\[([^\]\n]{8,140})\]\(https:\/\/www\.ebay\.co\.uk\/ebaylive\/events\//)?.[1]?.trim() ||
      before.match(/Image \d+: ([^\]]+)\]/)?.[1]?.trim() ||
      "eBay Live";
    const sellerName =
      window.match(/webp\)([^\]]{2,80})\]\(https:\/\/www\.ebay\.co\.uk\/ebaylive\/sellers\//)?.[1]?.trim() ||
      window.match(/([^\]\n]{2,60})\]\(https:\/\/www\.ebay\.co\.uk\/ebaylive\/sellers\//)?.[1]?.replace(/^.*webp\)/, "").trim() ||
      "eBay Live seller";
    const sellerHandle = window.match(/ebaylive\/sellers\/([^)/]+)/)?.[1];
    const viewers = Number(window.match(new RegExp(`\\[(\\d+)\\]\\(https://www\\.ebay\\.co\\.uk/ebaylive/events/${eventId}`))?.[1] || 0);
    const tags = [...window.matchAll(/ebaylive\/tags\/[^)]+\)\s*([A-Za-z0-9£& /+-]+)/g)].map((match) => match[1].trim());
    rooms.set(eventId, {
      platform: "ebay",
      eventId,
      title: title.replace(/^Image \d+:\s*/, ""),
      sellerName: sellerName.replace(/^Image \d+:\s*/, ""),
      sellerHandle,
      viewers: viewers || undefined,
      tags,
      startTime: clock ? parseHubClock(`${clock[1]}, ${clock[2]}`) : undefined,
      state,
    });
  }
  return [...rooms.values()];
}

async function fetchHubSession() {
  const res = await fetch("https://www.ebay.co.uk/ebaylive", {
    headers: { "user-agent": UA, "accept-language": "en-GB,en;q=0.9", accept: "text/html" },
    cache: "no-store",
  });
  const html = await res.text();
  const token = html.match(/(\d{10}:[a-f0-9]{32,64})/)?.[1] ?? "";
  const cookies = (
    res.headers.getSetCookie?.() ??
    (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : [])
  )
    .map((cookie) => cookie.split(";")[0])
    .filter(Boolean);
  return { token, cookies };
}

async function fetchEbayGraphql(channelId: string, token: string, cookies: string[]) {
  const res = await fetch("https://www.ebay.co.uk/d/graphql", {
    method: "POST",
    headers: {
      accept: "application/graphql-response+json, application/json",
      "content-type": "application/json",
      origin: "https://www.ebay.co.uk",
      referer: `https://www.ebay.co.uk/ebaylive?channel=${channelId}`,
      "user-agent": UA,
      "accept-language": "en-GB,en;q=0.9",
      "x-dp-token": token,
      "x-ebay-impression-page-id": "4626522",
      cookie: cookies.join("; "),
    },
    body: JSON.stringify({
      extensions: { persistedQuery: { sha256Hash: GQL_HASH, version: 1 } },
      operationName: "GetNextFilterFeed",
      variables: {
        context: { additionalQualifierContext: null, deviceInfo: "desktop" },
        feedInput: {
          enableDiagnostics: false,
          filterOptions: { liveEventsChannelId: channelId },
          itemCount: 40,
          requestNumber: 0,
          sessionId: "",
        },
        includeSellerProfile: true,
        renderableTemplateSelectionParameters: {
          filter: {
            comparator: "EQ",
            field: { moduleField: "MODULE_ID" },
            selection: "MODULE",
            value: MODULE_ID,
          },
        },
        templateId: TEMPLATE_ID,
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) return [];
  return walkEvents(await res.json());
}

async function fetchEbayMarkdown(path: string, state: "LIVE" | "UPCOMING" = "LIVE") {
  const res = await fetch(`https://r.jina.ai/https://www.ebay.co.uk${path}`, {
    headers: { accept: "text/plain" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  return parseEbayMarkdown(await res.text(), state);
}

function roomKey(room: IndexedRoom) {
  return `${room.platform}:${room.eventId}`;
}

function mergeRooms(groups: IndexedRoom[][]) {
  const rooms = new Map<string, IndexedRoom>();
  for (const group of groups) {
    for (const room of group) {
      if (!room.eventId || !room.title) continue;
      const key = roomKey(room);
      const current = rooms.get(key);
      if (!current) {
        rooms.set(key, room);
        continue;
      }
      rooms.set(key, {
        ...current,
        ...room,
        shopHandle: room.shopHandle || current.shopHandle,
        sellerHandle: room.sellerHandle || current.sellerHandle,
        startTime: room.startTime || current.startTime,
        viewers: room.viewers ?? current.viewers,
        state: current.state === "LIVE" || room.state === "LIVE" ? "LIVE" : room.state || current.state,
        tags: [...new Set([...current.tags, ...room.tags])],
      });
    }
  }
  return [...rooms.values()];
}

function platformNoun(platform: Platform) {
  if (platform === "ebay") return "eBay Live";
  if (platform === "whatnot") return "Whatnot";
  if (platform === "youtube") return "YouTube";
  return "TikTok";
}

export function roomsToStreams(rooms: IndexedRoom[]): { streams: Stream[]; sellers: Seller[] } {
  const sellers = new Map<string, Seller>();
  const streams = rooms.map((room) => {
    const category = inferCategory(room.title, room.tags);
    const slug = `${room.platform}-${slugify(room.sellerHandle || room.sellerName)}`;
    const noun = platformNoun(room.platform);
    if (!sellers.has(slug)) {
      sellers.set(slug, {
        slug,
        name: room.sellerName,
        platform: room.platform,
        handle: room.shopHandle,
        followers: 0,
        bookmarks: room.viewers ?? 0,
        rating: 4.6,
        showsHosted: 1,
        bio:
          room.state === "UPCOMING"
            ? `${room.sellerName} has an upcoming ${noun} show.`
            : `${room.sellerName} is live on ${noun}.`,
        specialties: [category],
      });
    }
    const upcoming = room.state === "UPCOMING";
    const start = room.startTime
      ? new Date(room.startTime)
      : new Date(Date.now() + (upcoming ? 60 * 60 * 1000 : -12 * 60 * 1000));
    const status: StreamStatus = upcoming ? "upcoming" : "live";
    return {
      id: `live-${room.platform}-${room.eventId}`,
      title: room.title,
      description:
        room.description ||
        (upcoming ? `${room.sellerName} is scheduled on ${noun}.` : `${room.sellerName} is live on ${noun} right now.`),
      platform: room.platform,
      sellerSlug: slug,
      sellerHandle: room.shopHandle,
      category,
      tags: [category, room.platform, "verified", upcoming ? "upcoming" : "live", ...room.tags.map((tag) => tag.toLowerCase())],
      startsAt: start.toISOString(),
      status,
      thumbnailHue: hue(room.eventId),
      itemCount: 0,
      viewers: room.viewers,
      bookmarks: room.viewers ?? 0,
      url: outboundUrl(room.platform, { eventId: room.eventId }),
      items: [],
    };
  });
  return { streams, sellers: [...sellers.values()] };
}

function parseViewers(text?: string) {
  if (!text) return undefined;
  const match = text.replace(/,/g, "").match(/([\d.]+)\s*([kmb])?/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return undefined;
  const unit = match[2]?.toLowerCase();
  if (unit === "k") return Math.round(value * 1000);
  if (unit === "m") return Math.round(value * 1_000_000);
  if (unit === "b") return Math.round(value * 1_000_000_000);
  return Math.round(value);
}

function youtubeText(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const node = value as { simpleText?: string; runs?: Array<{ text?: string }> };
  if (typeof node.simpleText === "string") return node.simpleText;
  const run = node.runs?.map((item) => item.text).filter(Boolean).join(" ");
  return run || undefined;
}

function isYoutubeLiveCard(value: Record<string, unknown>) {
  const blob = JSON.stringify(value.thumbnailOverlays ?? value.badges ?? "");
  if (/"text":"LIVE"/i.test(blob)) return true;
  const viewers = `${youtubeText(value.viewCountText) ?? ""} ${youtubeText(value.shortViewCountText) ?? ""}`;
  return /watching/i.test(viewers);
}

function walkYoutubeLives(node: unknown, rooms: IndexedRoom[] = [], assumeLive = false): IndexedRoom[] {
  if (!node || typeof node !== "object") return rooms;
  const value = node as Record<string, unknown>;
  const videoId = typeof value.videoId === "string" ? value.videoId : typeof value.videoID === "string" ? value.videoID : "";
  const title = youtubeText(value.title) ?? youtubeText(value.headline);
  const sellerName =
    youtubeText(value.shortBylineText) ?? youtubeText(value.ownerText) ?? youtubeText(value.longBylineText) ?? "YouTube Live";
  if (
    /^[A-Za-z0-9_-]{11}$/.test(videoId) &&
    title &&
    title.length >= 3 &&
    !/^(Search filters|Keyboard shortcuts)$/i.test(title) &&
    (assumeLive || isYoutubeLiveCard(value))
  ) {
    rooms.push({
      platform: "youtube",
      eventId: videoId,
      title,
      sellerName,
      sellerHandle: sellerName,
      shopHandle: sellerName,
      viewers: parseViewers(youtubeText(value.viewCountText) ?? youtubeText(value.shortViewCountText)),
      tags: ["watch"],
      state: "LIVE",
    });
  }
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach((item) => walkYoutubeLives(item, rooms, assumeLive));
    else walkYoutubeLives(child, rooms, assumeLive);
  }
  return rooms;
}

async function fetchYoutubeRooms(): Promise<IndexedRoom[]> {
  const res = await fetch("https://www.youtube.com/live", {
    headers: { "user-agent": UA, "accept-language": "en-GB,en;q=0.9", accept: "text/html" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  const rooms: IndexedRoom[][] = [];
  const initial = html.match(/var ytInitialData = (\{.+?\});<\/script>/s)?.[1];
  if (initial) {
    try {
      rooms.push(walkYoutubeLives(JSON.parse(initial)));
    } catch {
      // Fall through to InnerTube search.
    }
  }

  const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1] ?? "";
  const version = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "";
  if (key) {
    try {
      const search = await fetch(`https://www.youtube.com/youtubei/v1/search?prettyPrint=false&key=${key}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://www.youtube.com",
          referer: "https://www.youtube.com/live",
          "user-agent": UA,
          "accept-language": "en-GB,en;q=0.9",
        },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion: version || "2.20240901.00.00", hl: "en", gl: "GB" } },
          query: "live",
          params: "EgJAAQ%3D%3D",
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (search.ok) rooms.push(walkYoutubeLives(await search.json(), [], true));
    } catch {
      // Keep the /live board if search is blocked.
    }
  }

  return mergeRooms(rooms)
    .filter((room) => room.platform === "youtube")
    .sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0))
    .slice(0, 30);
}

function parseTiktokRooms(text: string): IndexedRoom[] {
  const rooms = new Map<string, IndexedRoom>();
  const handles = [
    ...text.matchAll(/tiktok\.com\/@([A-Za-z0-9._]{2,24})\/live/gi),
    ...text.matchAll(/"uniqueId":"([A-Za-z0-9._]{2,24})"/g),
  ];
  for (const match of handles) {
    const handle = match[1];
    if (!handle || rooms.has(handle)) continue;
    const at = text.indexOf(handle);
    const window = text.slice(Math.max(0, at - 180), at + 220);
    if (!/live|isLive":true|roomId/i.test(window) && !/\/live/i.test(match[0])) continue;
    const title =
      window.match(/"nickname":"([^"]{2,80})"/)?.[1] ||
      window.match(/"title":"([^"]{2,80})"/)?.[1] ||
      `@${handle} is live`;
    rooms.set(handle, {
      platform: "tiktok",
      eventId: handle,
      title,
      sellerName: title.replace(/\s+is live$/i, ""),
      sellerHandle: handle,
      shopHandle: handle,
      tags: ["watch"],
      state: "LIVE",
    });
  }
  return [...rooms.values()].slice(0, 24);
}

async function fetchTiktokRooms(): Promise<IndexedRoom[]> {
  const res = await fetch("https://www.tiktok.com/live", {
    headers: { "user-agent": UA, "accept-language": "en-GB,en;q=0.9", accept: "text/html" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return [];
  return parseTiktokRooms(await res.text());
}

let cache: { at: number; streams: Stream[]; sellers: Seller[]; source: string } | null = null;
const CACHE_MS = 90_000;

export async function getIndexedLiveRooms() {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache;
  const groups: IndexedRoom[][] = [];
  const sources: string[] = [];

  try {
    const session = await fetchHubSession();
    if (session.token) {
      const graphqlRooms = await Promise.all(EBAY_CHANNELS.map((channel) => fetchEbayGraphql(channel, session.token, session.cookies)));
      groups.push(...graphqlRooms);
      if (graphqlRooms.some((group) => group.length)) sources.push("ebay-graphql");
    }
  } catch {
    // Fall through to the public hub reader.
  }

  const extras = await Promise.allSettled([
    fetchEbayMarkdown("/ebaylive", "LIVE"),
    fetchEbayMarkdown("/ebaylive/upcoming-events", "UPCOMING"),
    fetchYoutubeRooms(),
    fetchTiktokRooms(),
  ]);
  const [hub, upcoming, youtube, tiktok] = extras.map((result) => (result.status === "fulfilled" ? result.value : []));
  groups.push(hub, upcoming, youtube, tiktok);
  if (hub.length || upcoming.length) sources.push("ebay-hub");
  if (youtube.length) sources.push("youtube");
  if (tiktok.length) sources.push("tiktok");

  const rooms = mergeRooms(groups);
  if (!rooms.length && cache) return cache;
  const mapped = roomsToStreams(rooms);
  registerIndexedSellers(mapped.sellers);
  cache = { at: Date.now(), source: sources.join("+") || "none", ...mapped };
  return cache;
}
