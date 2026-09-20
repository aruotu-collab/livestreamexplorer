"use client";

import Link from "next/link";
import { ScannerBar } from "@/components/ScannerBar";
import { StreamRail } from "@/components/StreamRail";
import { bargainStreams, collectionMatches, interestStreams } from "@/lib/intelligence";
import { useLiveFeed } from "@/lib/live-feed";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { user } = useStore();
  const { live, soon, tonight: night, week, discovered } = useLiveFeed();
  const interests = user ? interestStreams(user) : [];
  const bargains = bargainStreams(user).slice(0, 3);
  const collectionHits = user ? collectionMatches(user) : [];
  const matches: Record<string, number> = {};
  if (user) {
    for (const stream of week) {
      const n = stream.items.filter((item) =>
        user.watchlist.some((watch) => item.title.toLowerCase().includes(watch.query.split(" ")[0].toLowerCase()))
      ).length;
      if (n) matches[stream.id] = n;
    }
  }

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal">Sunday 20 September · UK</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-6xl">
            Find the livestream worth your time.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-paper-200/70">
            The calendar is free. The product is intelligence: which shows matter, which items are actually good buys, and when the thing you want appears live.
          </p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-ink-900 p-5 shadow-glow">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">Live now</p>
          <p className="mt-1 font-display text-5xl">{live.length}</p>
          <p className="text-sm text-paper-200/55">streams across eBay Live and Whatnot</p>
          {user ? (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat n={interests.length} label="match you" />
              <Stat n={bargains.length} label="bargains" hot />
              <Stat n={collectionHits.length} label="collection" />
            </div>
          ) : (
            <Link href="/signup" className="btn-gold mt-5 w-full">
              Create a free Watch Agent
            </Link>
          )}
        </div>
      </section>

      <ScannerBar />
      <StreamRail
        title="Just spotted"
        eyebrow="Unscheduled · not on the original calendar"
        streams={discovered}
        user={user}
        matches={matches}
      />
      <StreamRail title="Live now" eyebrow="On air" href="/calendar" streams={live} user={user} matches={matches} />
      <StreamRail title="Starting soon" eyebrow="Next hour" href="/calendar" streams={soon} user={user} matches={matches} />
      <StreamRail title="Tonight" eyebrow="After 5pm" href="/tonight" streams={night} user={user} matches={matches} />
      <StreamRail title="This week" eyebrow="7-day calendar" href="/calendar" streams={week} user={user} matches={matches} />
    </div>
  );
}

function Stat({ n, label, hot }: { n: number; label: string; hot?: boolean }) {
  return (
    <div className="rounded-xl bg-ink-800 px-2 py-3">
      <p className={`font-display text-2xl ${hot ? "text-gold" : "text-teal"}`}>{n}</p>
      <p className="text-paper-200/50">{label}</p>
    </div>
  );
}
