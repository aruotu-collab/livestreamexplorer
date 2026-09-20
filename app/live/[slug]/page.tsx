"use client";

import { useParams } from "next/navigation";
import { StreamCard } from "@/components/StreamCard";
import { CATEGORIES } from "@/lib/catalog";
import { useLiveFeed } from "@/lib/live-feed";
import { useStore } from "@/lib/store";

export default function LiveHubPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useStore();
  const { week } = useLiveFeed();
  const category = CATEGORIES.find((item) => item.slug === slug);
  const streams =
    slug === "ebay" || slug === "whatnot"
      ? week.filter((stream) => stream.platform === slug)
      : week.filter((stream) => stream.category === slug);
  const title = slug === "ebay" ? "eBay Live" : slug === "whatnot" ? "Whatnot" : category?.label ?? slug;
  const blurb =
    slug === "ebay"
      ? "Scheduled eBay Live events with stable event URLs."
      : slug === "whatnot"
        ? "Seller shows indexed from public upcoming-show structure."
        : category?.blurb ?? "";

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Public calendar page</p>
        <h1 className="mt-2 font-display text-5xl">{title} livestreams</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">{blurb}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {streams.map((stream) => (
          <StreamCard key={stream.id} stream={stream} user={user} />
        ))}
      </div>
    </div>
  );
}
