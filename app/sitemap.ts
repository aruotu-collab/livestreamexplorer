import type { MetadataRoute } from "next";
import { ALL_STREAMS, CATEGORIES, SELLERS } from "@/lib/catalog";
import { PLATFORMS } from "@/lib/platforms";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://livestreamexplorer.com").replace(/\/$/, "");
}

function page(path: string, extras: Omit<MetadataRoute.Sitemap[number], "url"> = {}): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl()}${path}`,
    lastModified: new Date(),
    ...extras,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    page("/", { changeFrequency: "hourly", priority: 1 }),
    page("/guide", { changeFrequency: "hourly", priority: 0.9 }),
    page("/tonight", { changeFrequency: "hourly", priority: 0.8 }),
    page("/calendar", { changeFrequency: "daily", priority: 0.7 }),
    page("/items", { changeFrequency: "hourly", priority: 0.8 }),
    page("/watch", { changeFrequency: "hourly", priority: 0.7 }),
    page("/search", { changeFrequency: "weekly", priority: 0.5 }),
    page("/pricing", { changeFrequency: "monthly", priority: 0.4 }),
    page("/about", { changeFrequency: "monthly", priority: 0.4 }),
    page("/list-your-stream", { changeFrequency: "monthly", priority: 0.3 }),
    ...CATEGORIES.map((category) =>
      page(`/live/${category.slug}`, { changeFrequency: "hourly", priority: 0.8 }),
    ),
    ...PLATFORMS.map((platform) =>
      page(`/live/${platform.slug}`, { changeFrequency: "hourly", priority: 0.7 }),
    ),
    ...SELLERS.map((seller) =>
      page(`/seller/${seller.slug}`, { changeFrequency: "weekly", priority: 0.5 }),
    ),
    ...ALL_STREAMS.map((stream) =>
      page(`/stream/${stream.id}`, { changeFrequency: "hourly", priority: 0.6 }),
    ),
  ];
}
