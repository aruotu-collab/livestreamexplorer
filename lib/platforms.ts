import type { Category, Platform } from "./types";

export type PlatformStatus = "live" | "coming-soon";

export interface PlatformInfo {
  slug: Platform;
  label: string;
  shortLabel: string;
  blurb: string;
  status: PlatformStatus;
}

export const PLATFORMS: PlatformInfo[] = [
  {
    slug: "ebay",
    label: "eBay Live",
    shortLabel: "eBay",
    status: "live",
    blurb: "Scheduled eBay Live events with stable event URLs.",
  },
  {
    slug: "whatnot",
    label: "Whatnot",
    shortLabel: "Whatnot",
    status: "live",
    blurb: "Seller shows indexed from public upcoming-show structure.",
  },
  {
    slug: "youtube",
    label: "YouTube Live",
    shortLabel: "YouTube",
    status: "coming-soon",
    blurb: "YouTube Live shops and creator rooms. Watch Agents will open on YouTube — intelligence stays here.",
  },
  {
    slug: "tiktok",
    label: "TikTok Live",
    shortLabel: "TikTok",
    status: "coming-soon",
    blurb: "TikTok LIVE shopping rooms. Same buyer layer: find the show, then jump in on TikTok.",
  },
];

export const LIVE_PLATFORMS = PLATFORMS.filter((platform) => platform.status === "live");

export function platformBySlug(slug: string) {
  return PLATFORMS.find((platform) => platform.slug === slug);
}

export function isPlatformSlug(slug: string): slug is Platform {
  return PLATFORMS.some((platform) => platform.slug === slug);
}

export function platformLabel(slug: string, variant: "full" | "short" = "full") {
  const platform = platformBySlug(slug);
  if (!platform) return slug;
  return variant === "short" ? platform.shortLabel : platform.label;
}

export function livePlatformSentence() {
  const names = LIVE_PLATFORMS.map((platform) => platform.label);
  if (names.length <= 1) return names[0] ?? "live platforms";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function platformHubUrl(platform: Platform) {
  if (platform === "ebay") return "https://www.ebay.co.uk/ebaylive";
  if (platform === "whatnot") return "https://www.whatnot.com/";
  if (platform === "youtube") return "https://www.youtube.com/";
  return "https://www.tiktok.com/live";
}

const EBAY_EVENT_ID = /^[A-Za-z0-9]{10,}$/;
const WHATNOT_LIVE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const YOUTUBE_VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

const EBAY_LIVES: Partial<Record<Category, string[]>> = {
  pokemon: ["SvCq5HNzkB1NoBj8", "CECC48X2DuwqWPFI"],
  sneakers: ["YODpl7msgzs0V82A", "0bz2S0xsaWlSZZLy"],
  fashion: ["P5HYGejn3UXyjzz6", "28XvDcC52nzqvWOD"],
  electronics: ["keAQJKsPfexPOmj4", "VZr6STuRYpZEYGVh"],
  vintage: ["SvCq5HNzkB1NoBj8", "P5HYGejn3UXyjzz6"],
  coins: ["eLvQHX3H1YXzQ40N", "7wpSF9YYtgUFNdgR"],
  memorabilia: ["XI6ydYo5ACLiHYdq", "VZr6STuRYpZEYGVh"],
  "football-cards": ["CECC48X2DuwqWPFI", "SvCq5HNzkB1NoBj8"],
  "basketball-cards": ["CECC48X2DuwqWPFI", "SvCq5HNzkB1NoBj8"],
  luxury: ["P5HYGejn3UXyjzz6", "28XvDcC52nzqvWOD"],
  watches: ["eLvQHX3H1YXzQ40N", "7wpSF9YYtgUFNdgR"],
  comics: ["SvCq5HNzkB1NoBj8", "CECC48X2DuwqWPFI"],
};

const WHATNOT_LIVES: Partial<Record<Category, string[]>> = {
  sneakers: [
    "116f8757-3ec7-4bd0-8770-c206c0a5b7a7",
    "c1ce3e34-6229-4c03-8460-cc40407e1312",
    "72b4c609-47e2-43d8-882f-971c4f563322",
    "5ffbad29-8c42-425f-bb54-1307f249b8a1",
  ],
  pokemon: [
    "12bfb8a4-ca3a-4570-a022-e4d4d6e65cef",
    "d9875b89-35e3-4e98-b2a3-89ff4124f238",
    "af98eabc-3ddd-427c-9771-2b63738f1b09",
    "562a049a-a2d1-4669-92fb-ac9130b9d38c",
  ],
  "football-cards": ["c0334c08-b7ee-468c-83a8-dd04f2c92fb8", "ed5a1798-fac4-442f-a7fa-a797778b24d7"],
  "basketball-cards": ["a0647a48-08aa-466b-ad25-1a513b418742", "31c7f97f-3897-45b2-823b-3361d08c7cf8"],
  vintage: ["d9875b89-35e3-4e98-b2a3-89ff4124f238", "116f8757-3ec7-4bd0-8770-c206c0a5b7a7"],
  fashion: ["c1ce3e34-6229-4c03-8460-cc40407e1312", "43ce73f7-1e35-4757-bcba-efa6ad7b7f92"],
};

function pickFromPool(pool: string[] | undefined, seed?: string | null) {
  if (!pool?.length) return null;
  if (!seed) return pool[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

function pickWhatnotLiveId(category?: string | null, seed?: string | null) {
  return pickFromPool(WHATNOT_LIVES[(category as Category) ?? "pokemon"] ?? WHATNOT_LIVES.pokemon, seed);
}

function pickEbayLiveId(category?: string | null, seed?: string | null) {
  return pickFromPool(EBAY_LIVES[(category as Category) ?? "pokemon"] ?? EBAY_LIVES.electronics, seed);
}

export function outboundUrl(
  platform: Platform,
  opts?: { eventId?: string | null; query?: string | null; category?: string | null; seed?: string | null },
) {
  const eventId = opts?.eventId?.trim() ?? "";

  if (platform === "ebay") {
    if (EBAY_EVENT_ID.test(eventId) && !/^ebay/i.test(eventId)) {
      return `https://www.ebay.co.uk/ebaylive/events/${eventId}/stream`;
    }
    const liveId = pickEbayLiveId(opts?.category, opts?.seed);
    if (liveId) return `https://www.ebay.co.uk/ebaylive/events/${liveId}/stream`;
    return platformHubUrl("ebay");
  }

  if (platform === "whatnot") {
    if (WHATNOT_LIVE_ID.test(eventId)) return `https://www.whatnot.com/live/${eventId}`;
    const liveId = pickWhatnotLiveId(opts?.category, opts?.seed);
    if (liveId) return `https://www.whatnot.com/live/${liveId}`;
    return platformHubUrl("whatnot");
  }

  if (platform === "youtube") {
    if (YOUTUBE_VIDEO_ID.test(eventId)) return `https://www.youtube.com/watch?v=${eventId}`;
    return platformHubUrl("youtube");
  }

  return platformHubUrl("tiktok");
}

export function eventUrlForPlatform(
  platform: Platform,
  id?: string | null,
  query?: string | null,
  extras?: { category?: string | null; seed?: string | null },
) {
  return outboundUrl(platform, { eventId: id, query, category: extras?.category, seed: extras?.seed });
}
