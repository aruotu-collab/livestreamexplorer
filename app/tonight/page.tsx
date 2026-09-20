"use client";

import Link from "next/link";
import { StreamCard } from "@/components/StreamCard";
import { tonightPicks } from "@/lib/intelligence";
import { useLiveFeed } from "@/lib/live-feed";
import { Boot, useStore } from "@/lib/store";
import { formatClock, gbp } from "@/lib/time";

export default function TonightPage() {
  return (
    <Boot>
      <TonightInner />
    </Boot>
  );
}

function TonightInner() {
  const { user } = useStore();
  const { tonight: all, timeZone } = useLiveFeed();
  const picks = user ? tonightPicks(user) : [];

  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Personalised feed</p>
        <h1 className="mt-2 font-display text-5xl">Your tonight</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          Not more content. Less noise. We keep the shows that match your interests, watchlists and collection — and filter the rest.
        </p>
      </header>

      {!user ? (
        <div className="rounded-3xl border border-gold/20 bg-ink-900 p-8">
          <p className="font-display text-3xl">Create an account to turn 300 streams into a short list.</p>
          <Link href="/signup" className="btn-gold mt-5">
            Start with one free agent
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          <p className="text-sm text-paper-200/50">
            We filtered {Math.max(all.length - picks.length, 0)} other streams for you.
          </p>
          {picks.map(({ stream, items, opp }) => (
            <Link
              key={stream.id}
              href={`/stream/${stream.id}`}
              className="grid gap-4 rounded-2xl border border-white/8 bg-ink-900 p-5 transition hover:border-gold/30 md:grid-cols-[140px_1fr_auto]"
            >
              <div>
                <p className="font-display text-3xl">{formatClock(stream.startsAt, timeZone)}</p>
                <p className="text-xs uppercase text-paper-200/45">{stream.platform}</p>
              </div>
              <div>
                <p className="font-display text-2xl">{stream.title}</p>
                <p className="text-sm text-paper-200/55">
                  {items.length} watchlist match{items.length === 1 ? "" : "es"} · Opportunity {opp.score}
                </p>
                {items[0] && (
                  <p className="mt-2 text-sm text-teal">
                    {items[0].title} · live {gbp(items[0].currentPrice ?? items[0].startingPrice)} vs median {gbp(items[0].marketMedian)}
                  </p>
                )}
              </div>
              <span className="self-center text-gold">Open →</span>
            </Link>
          ))}
        </section>
      )}

      <section>
        <h2 className="font-display text-3xl">Full tonight calendar</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((stream) => (
            <StreamCard key={stream.id} stream={stream} user={user} />
          ))}
        </div>
      </section>
    </div>
  );
}
