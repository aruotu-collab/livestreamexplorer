"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrowseLinks } from "@/components/PageBack";
import { ScannerBar } from "@/components/ScannerBar";
import { ItemRail } from "@/components/ItemRail";
import { StreamRail } from "@/components/StreamRail";
import { bargainStreams, collectionMatches, interestStreams } from "@/lib/intelligence";
import { useLiveFeed } from "@/lib/live-feed";
import { platformHubUrl } from "@/lib/platforms";
import { takeSoonest } from "@/lib/time";
import { formatZoneDate } from "@/lib/zone";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { user } = useStore();
  const { live, upcoming, tonight: night, week, discovered, lots, clock, timeZone, zoneLabel } = useLiveFeed();
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

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const node = document.getElementById(id);
    if (!node) return;
    requestAnimationFrame(() => node.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  return (
    <div className="space-y-14">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal">
            {formatZoneDate(clock, timeZone)} · {zoneLabel}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[0.95] sm:text-5xl">
            Find the livestream worth your time.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-paper-200/70">
            The calendar is free. The product is intelligence: which shows matter, which items are actually good buys, and when the thing you want appears live.
          </p>
          <div className="mt-5">
            <BrowseLinks />
          </div>
        </div>
        <div className="rounded-3xl border border-white/8 bg-ink-900 p-5 shadow-glow">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">Live now</p>
          <p className="mt-1 font-display text-5xl">{live.length}</p>
          <p className="text-sm text-paper-200/55">streams across live selling platforms</p>
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

      <div id="just-spotted" className="scroll-mt-48 space-y-14">
        <ScannerBar />
        <StreamRail
          title="Just spotted"
          eyebrow="Unscheduled · not on the original calendar"
          streams={discovered}
          user={user}
          matches={matches}
        />
      </div>
      {live.length ? (
        <StreamRail
          id="live-now"
          title="Live now"
          eyebrow="Rooms that are actually on"
          href="/calendar"
          streams={live}
          user={user}
          matches={matches}
        />
      ) : (
        <section id="live-now" className="scroll-mt-48 rounded-2xl border border-white/8 bg-ink-900 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Live now</p>
          <h2 className="mt-1 font-display text-3xl">Finding rooms that are actually on</h2>
          <p className="mt-3 max-w-xl text-sm text-paper-200/65">
            We only list a show when we can open that exact eBay or Whatnot room. If this is empty for a moment, use the live boards.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={platformHubUrl("ebay")} target="_blank" rel="noopener noreferrer" className="btn-live">
              Open eBay Live
            </a>
            <a href={platformHubUrl("whatnot")} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Open Whatnot
            </a>
          </div>
        </section>
      )}
      {lots.length ? (
        <ItemRail
          id="on-the-block"
          title="Listed by live sellers"
          eyebrow="Real eBay listings · not invented lots"
          href="/items"
          lots={lots}
        />
      ) : live.length ? (
        <section id="on-the-block" className="scroll-mt-48 rounded-2xl border border-white/8 bg-ink-900 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Item calendar</p>
          <h2 className="mt-1 font-display text-3xl">Finding listed items</h2>
          <p className="mt-3 max-w-xl text-sm text-paper-200/65">
            We only show stock we can open on eBay. If a seller has not posted shop listings, the item row stays empty — the room can still be live.
          </p>
        </section>
      ) : null}
      <StreamRail
        id="starting-soon"
        title="Starting soon"
        eyebrow="Soonest first"
        href="/calendar"
        streams={takeSoonest(upcoming)}
        user={user}
        matches={matches}
      />
      <StreamRail
        id="tonight"
        title="Tonight"
        eyebrow="After 5pm"
        href="/tonight"
        streams={night}
        user={user}
        matches={matches}
      />
      <StreamRail
        id="this-week"
        title="This week"
        eyebrow="7-day calendar"
        href="/calendar"
        streams={week}
        user={user}
        matches={matches}
      />
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
