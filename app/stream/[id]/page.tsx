"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryLabel, sellerBySlug } from "@/lib/catalog";
import { platformLabel } from "@/lib/platforms";
import { comparables, getStream, opportunity } from "@/lib/intelligence";
import { useStore } from "@/lib/store";
import { dealPct } from "@/lib/intelligence";
import { useLiveFeed } from "@/lib/live-feed";
import { formatCountdown, formatElapsed, formatWhen, gbp, msUntil, pct } from "@/lib/time";

export default function StreamPage() {
  const { id } = useParams<{ id: string }>();
  const { catalog, clock, discovered, timeZone } = useLiveFeed();
  const stream = catalog.find((item) => item.id === id) ?? getStream(id, discovered);
  const { user, toggleFavorite } = useStore();

  if (!stream) {
    return <p>Stream not found.</p>;
  }

  const seller = sellerBySlug(stream.sellerSlug);
  const opp = opportunity(stream, user);
  const saved = user?.favorites.includes(stream.id);

  return (
    <article className="space-y-10">
      <header className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
            {platformLabel(stream.platform)} · {categoryLabel(stream.category)}
          </p>
          <h1 className="mt-2 font-display text-5xl leading-tight">{stream.title}</h1>
          <p className="mt-4 text-paper-200/70">{stream.description}</p>
          <p className="mt-4 text-sm text-paper-200/55">
            {formatWhen(stream.startsAt, clock, timeZone)} · {stream.itemCount} items · {stream.bookmarks} bookmarks
            {stream.unscheduled ? " · picked up by the scanner" : ""}
          </p>
          <p className={`mt-4 font-mono text-4xl tabular-nums ${stream.status === "live" ? "text-live" : "text-gold"}`}>
            {stream.status === "live" ? formatElapsed(-msUntil(stream.startsAt, clock)) : formatCountdown(msUntil(stream.startsAt, clock))}
            <span className="ml-3 text-sm uppercase tracking-[0.16em] text-paper-200/45">
              {stream.status === "live" ? "on air" : "until start"}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={stream.url} target="_blank" rel="noopener noreferrer" className="btn-live">
              {stream.status === "live" ? "Jump in now on" : "Open on"} {platformLabel(stream.platform, "short")}
            </a>
            {user && (
              <button onClick={() => toggleFavorite(stream.id)} className="btn-ghost">
                {saved ? "Saved" : "Save show"}
              </button>
            )}
            <Link href={`/seller/${stream.sellerSlug}`} className="btn-ghost">
              {seller?.name}
            </Link>
          </div>
          <p className="mt-3 text-xs text-paper-200/45">
            Opens the real {platformLabel(stream.platform)} live board. We do not host the stream.
          </p>
        </div>
        <aside className="rounded-3xl border border-gold/20 bg-ink-900 p-6 shadow-glow">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Opportunity score</p>
          <p className="mt-2 font-display text-6xl">{opp.score}</p>
          <p className="text-sm text-paper-200/55">Measurable signals — not a vague seller rating.</p>
          <ul className="mt-5 space-y-3">
            {opp.reasons.map((reason) => (
              <li key={reason.label} className="text-sm">
                <span className={reason.impact === "positive" ? "text-teal" : reason.impact === "negative" ? "text-live" : "text-paper-200/70"}>
                  {reason.label}
                </span>
                <p className="text-paper-200/55">{reason.detail}</p>
              </li>
            ))}
          </ul>
        </aside>
      </header>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Deal intelligence</h2>
          {!user || user.plan === "free" ? (
            <Link href="/pricing" className="text-sm text-gold">
              Unlock full market snapshots on Pro
            </Link>
          ) : null}
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-800 font-mono text-[10px] uppercase tracking-[0.14em] text-paper-200/50">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Live / start</th>
                <th className="px-4 py-3">Recent median</th>
                <th className="px-4 py-3">Range</th>
                <th className="px-4 py-3">Deal</th>
              </tr>
            </thead>
            <tbody>
              {stream.items.map((item) => {
                const delta = dealPct(item);
                const comps = comparables(item);
                return (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-paper-200/45">
                        {item.set} · {item.grade}
                      </p>
                      {user && user.plan !== "free" && comps[0] && (
                        <p className="mt-1 text-[11px] text-signal">
                          Also tonight/this week: {gbp(comps[0].item.startingPrice)} on {platformLabel(comps[0].stream.platform, "short")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{gbp(item.currentPrice ?? item.startingPrice)}</td>
                    <td className="px-4 py-3">{user?.plan === "collector" ? gbp(item.marketMedian) : user ? gbp(item.marketMedian) : "—"}</td>
                    <td className="px-4 py-3 text-paper-200/55">
                      {user && user.plan !== "free" ? `${gbp(item.marketLow)}–${gbp(item.marketHigh)}` : "Pro"}
                    </td>
                    <td className={`px-4 py-3 ${delta < 0 ? "text-teal" : "text-paper-200/60"}`}>{pct(delta)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-paper-200/40">
          Market information, not a buy recommendation. Comparables are prototype estimates from recent sold ranges.
        </p>
      </section>
    </article>
  );
}
