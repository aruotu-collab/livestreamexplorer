import Link from "next/link";
import { BrowseLinks, PageBack } from "@/components/PageBack";
import { WATCH_PLATFORMS, platformHubUrl } from "@/lib/platforms";

export default function WatchPage() {
  return (
    <div className="space-y-8">
      <PageBack href="/" label="Back to Shop live" />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Watch live</p>
        <h1 className="mt-2 font-display text-5xl">Who is on. Not what is for sale.</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          YouTube and TikTok are watch rooms. Shop live stays on eBay and Whatnot — rooms, items, agents. Here we will index who is live so you can jump in to watch.
        </p>
        <div className="mt-4">
          <BrowseLinks current="watch" />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {WATCH_PLATFORMS.map((platform) => (
          <article key={platform.slug} className="rounded-3xl border border-white/8 bg-ink-900 p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">Coming next</p>
            <h2 className="mt-2 font-display text-3xl">{platform.label}</h2>
            <p className="mt-3 text-paper-200/65">{platform.blurb}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/live/${platform.slug}`} className="btn-ghost">
                {platform.shortLabel} on LSE
              </Link>
              <a href={platformHubUrl(platform.slug)} target="_blank" rel="noreferrer" className="btn-gold">
                Open {platform.shortLabel}
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
