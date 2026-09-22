import type { Platform } from "./types";

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

export function isVerifiedLiveUrl(url?: string | null) {
  if (!url) return false;
  return (
    /whatnot\.com\/live\/[0-9a-f]{8}-[0-9a-f-]{27}/i.test(url) ||
    /ebay\.[^/]+\/ebaylive\/events\/[A-Za-z0-9]+\/stream/i.test(url)
  );
}

export function outboundCta(platform: Platform, opts?: { live?: boolean; url?: string | null }) {
  const name = platformLabel(platform, "short");
  if (opts?.live && isVerifiedLiveUrl(opts.url)) return `Jump in now on ${name}`;
  return `Find live rooms on ${name}`;
}

export function outboundUrl(
  platform: Platform,
  opts?: { eventId?: string | null; query?: string | null; category?: string | null; seed?: string | null },
) {
  const eventId = opts?.eventId?.trim() ?? "";
  const query = opts?.query?.trim() ?? "";

  if (platform === "ebay") {
    if (EBAY_EVENT_ID.test(eventId) && !/^ebay/i.test(eventId)) {
      return `https://www.ebay.co.uk/ebaylive/events/${eventId}/stream`;
    }
    return platformHubUrl("ebay");
  }

  if (platform === "whatnot") {
    if (WHATNOT_LIVE_ID.test(eventId)) return `https://www.whatnot.com/live/${eventId}`;
    if (query) return `https://www.whatnot.com/search?q=${encodeURIComponent(query)}`;
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
