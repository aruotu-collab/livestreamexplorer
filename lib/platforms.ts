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

export function eventUrlForPlatform(platform: Platform, id: string) {
  if (platform === "ebay") return `https://www.ebay.co.uk/ebaylive/events/${id}`;
  if (platform === "whatnot") return `https://www.whatnot.com/live/${id}`;
  if (platform === "youtube") return `https://www.youtube.com/watch?v=${id}`;
  return `https://www.tiktok.com/live/${id}`;
}
