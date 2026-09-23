"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BrowseLinks, PageBack } from "@/components/PageBack";
import { StreamCard } from "@/components/StreamCard";
import { CATEGORIES } from "@/lib/catalog";
import { useLiveFeed } from "@/lib/live-feed";
import { isPlatformSlug, platformBySlug } from "@/lib/platforms";
import { byStartTime } from "@/lib/time";
import { useStore } from "@/lib/store";

export default function LiveHubPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useStore();
  const { live, watchLive, upcoming } = useLiveFeed();
  const platform = platformBySlug(slug);
  const category = CATEGORIES.find((item) => item.slug === slug);
  const pool = platform?.kind === "watch" ? watchLive : live;
  const match = (stream: (typeof live)[number]) =>
    isPlatformSlug(slug) ? stream.platform === slug : stream.category === slug;
  const onAir = pool.filter(match).sort(byStartTime);
  const nextUp = upcoming.filter(match).sort(byStartTime);
  const title = platform?.label ?? category?.label ?? slug;
  const blurb = platform?.blurb ?? category?.blurb ?? "";

  return (
    <div className="space-y-8">
      <PageBack
        href={platform?.kind === "watch" ? "/watch" : "/tonight"}
        label={platform?.kind === "watch" ? "Back to Watch live" : "Back to tonight"}
      />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
          {platform?.kind === "watch" ? "Watch live" : platform ? "Shop live" : "Public calendar page"}
        </p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{title} livestreams</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">{blurb}</p>
        <div className="mt-4">
          <BrowseLinks />
        </div>
      </header>
      {platform?.status === "coming-soon" && !onAir.length ? (
        <div className="rounded-3xl border border-dashed border-teal/30 bg-ink-900 p-8">
          <p className="font-display text-3xl">Coming next.</p>
          <p className="mt-3 max-w-xl text-paper-200/65">
            {platform.kind === "watch"
              ? `${title} is watch live, not a shop. We will index who is on camera and send you out to watch. No item calendar, no lots.`
              : `${title} is on the map. We will index public rooms the same way as eBay Live and Whatnot — then send you out to the platform. No marketplace here.`}
          </p>
          <Link href={platform.kind === "watch" ? "/watch" : "/"} className="btn-gold mt-6">
            {platform.kind === "watch" ? "Back to Watch live" : "Browse Shop live"}
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {onAir.length > 0 && (
            <section className="space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Started first</p>
                <h2 className="font-display text-3xl">Live now</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {onAir.map((stream) => (
                  <StreamCard key={stream.id} stream={stream} user={user} />
                ))}
              </div>
            </section>
          )}
          <section className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Soonest first</p>
              <h2 className="font-display text-3xl">Starting soon</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nextUp.map((stream) => (
                <StreamCard key={stream.id} stream={stream} user={user} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
