"use client";

import Link from "next/link";
import { BrowseLinks, PageBack } from "@/components/PageBack";
import { StreamRail } from "@/components/StreamRail";
import { useLiveFeed } from "@/lib/live-feed";
import { WATCH_PLATFORMS, platformHubUrl } from "@/lib/platforms";
import { useStore } from "@/lib/store";

export default function WatchPage() {
  const { user } = useStore();
  const { watchLive } = useLiveFeed();
  const youtube = watchLive.filter((stream) => stream.platform === "youtube");
  const tiktok = watchLive.filter((stream) => stream.platform === "tiktok");

  return (
    <div className="space-y-10">
      <PageBack href="/" label="Back to Shop live" />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Watch live</p>
        <h1 className="mt-2 font-display text-5xl">Who is on. Not what is for sale.</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          We only list a YouTube or TikTok room when we can open that exact video or live URL. Shop live stays on eBay and Whatnot.
        </p>
        <div className="mt-4">
          <BrowseLinks current="watch" />
        </div>
      </header>

      {youtube.length ? (
        <StreamRail
          title="YouTube Live"
          eyebrow="Rooms that are actually on"
          href="/live/youtube"
          streams={youtube}
          user={user}
        />
      ) : (
        <section className="rounded-3xl border border-dashed border-teal/30 bg-ink-900 p-8">
          <p className="font-display text-3xl">Finding who is on YouTube</p>
          <p className="mt-3 max-w-xl text-paper-200/65">
            The scanner is reading the public YouTube Live board. If this is empty for a moment, open YouTube itself.
          </p>
          <a href={platformHubUrl("youtube")} target="_blank" rel="noreferrer" className="btn-gold mt-6">
            Open YouTube Live
          </a>
        </section>
      )}

      {tiktok.length ? (
        <StreamRail title="TikTok Live" eyebrow="Rooms that are actually on" href="/live/tiktok" streams={tiktok} user={user} />
      ) : (
        <section className="rounded-3xl border border-white/8 bg-ink-900 p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">Coming next</p>
          <h2 className="mt-2 font-display text-3xl">TikTok Live</h2>
          <p className="mt-3 max-w-xl text-paper-200/65">
            TikTok does not publish a room list we can read the way YouTube and eBay do. We will add a card here the moment we can open that exact live URL. Until then, jump in on TikTok.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/live/tiktok" className="btn-ghost">
              TikTok on LSE
            </Link>
            <a href={platformHubUrl("tiktok")} target="_blank" rel="noreferrer" className="btn-gold">
              Open TikTok Live
            </a>
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {WATCH_PLATFORMS.map((platform) => (
          <article key={platform.slug} className="rounded-3xl border border-white/8 bg-ink-900 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">{platform.label}</p>
            <p className="mt-3 text-paper-200/65">{platform.blurb}</p>
            <Link href={`/live/${platform.slug}`} className="mt-5 inline-block text-sm text-teal hover:text-paper-50">
              All {platform.shortLabel} rooms →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
