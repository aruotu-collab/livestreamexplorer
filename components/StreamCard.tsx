"use client";

import Link from "next/link";
import { categoryLabel, sellerBySlug } from "@/lib/catalog";
import { dealPct, opportunity } from "@/lib/intelligence";
import { useOptionalFeed } from "@/lib/live-feed";
import { formatCountdown, formatElapsed, formatWhen, gbp, msUntil, now } from "@/lib/time";
import type { Stream, UserState } from "@/lib/types";

export function StreamCard({
  stream,
  user,
  compact,
  matchCount,
}: {
  stream: Stream;
  user?: UserState | null;
  compact?: boolean;
  matchCount?: number;
}) {
  const feed = useOptionalFeed();
  const clock = feed?.clock ?? now();
  const seller = sellerBySlug(stream.sellerSlug);
  const opp = opportunity(stream, user);
  const live = stream.status === "live";
  const soon = stream.status === "soon";
  const remaining = msUntil(stream.startsAt, clock);
  const elapsed = -remaining;
  const viewers = live ? (stream.viewers ?? 40) + Math.floor(Math.max(0, elapsed) / 60000) : stream.viewers;
  const best = [...stream.items].sort((a, b) => dealPct(a) - dealPct(b))[0];
  const bestDelta = best ? dealPct(best) : 0;
  const fromPrice = stream.items.length ? Math.min(...stream.items.map((item) => item.startingPrice)) : null;

  return (
    <Link
      href={`/stream/${stream.id}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-ink-900/80 transition hover:-translate-y-0.5 ${
        live
          ? "border-live/40 shadow-live hover:border-live/70"
          : soon
            ? "border-gold/25 hover:border-gold/50 hover:shadow-glow"
            : "border-white/8 hover:border-gold/30 hover:shadow-glow"
      }`}
    >
      <div
        className="thumb-grid px-3 py-2.5"
        style={{ backgroundColor: `hsl(${stream.thumbnailHue} 28% 14%)` }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1">
            {live ? (
              <span className="chip border-live/50 bg-live/20 text-live">
                <span className="pulse-live h-1.5 w-1.5 rounded-full bg-live" /> Live
              </span>
            ) : soon ? (
              <span className="chip border-gold/40 text-gold">Soon</span>
            ) : (
              <span className="chip">{formatWhen(stream.startsAt, clock)}</span>
            )}
            <span className="chip">{stream.platform === "ebay" ? "eBay" : "Whatnot"}</span>
            {stream.unscheduled && <span className="chip border-teal/40 text-teal">Just spotted</span>}
            {stream.sponsored && <span className="chip border-gold/40 text-gold">Sponsored</span>}
          </div>
          <span className="shrink-0 rounded-full bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] text-gold">
            Opp {opp.score}
          </span>
        </div>
        <p className={`mt-2 font-mono text-[1.65rem] tabular-nums leading-none ${live ? "text-live" : soon ? "text-gold" : "text-paper-50"}`}>
          {live ? formatElapsed(elapsed) : formatCountdown(remaining)}
          <span className="ml-2 align-middle font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/50">
            {live ? "on air" : soon ? "starts in" : "countdown"}
          </span>
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/45">
          {categoryLabel(stream.category)} · {stream.itemCount} items
          {!live && fromPrice !== null ? ` · from ${gbp(fromPrice)}` : ""}
        </p>
        <h3 className={`font-display text-[1.2rem] leading-tight ${live ? "group-hover:text-live" : "group-hover:text-gold"}`}>
          {stream.title}
        </h3>
        <p className="text-sm text-paper-200/65">
          {seller?.name}
          {live && viewers ? ` · ${viewers.toLocaleString()} watching` : ""}
          {!live && !compact && seller ? ` · ${seller.followers.toLocaleString()} followers` : ""}
        </p>
        {live && best && bestDelta <= -8 ? (
          <p className="text-sm text-gold">
            {best.title} · {Math.abs(bestDelta).toFixed(0)}% under · {gbp(best.currentPrice ?? best.startingPrice)} live
          </p>
        ) : live ? (
          <p className="text-sm text-paper-200/55">Room is open · bids happening now</p>
        ) : null}
        {typeof matchCount === "number" && matchCount > 0 && (
          <p className="text-xs text-teal">🎯 {matchCount} watchlist match{matchCount === 1 ? "" : "es"}</p>
        )}
        <span className={`pt-1 text-sm ${live ? "text-live" : "text-paper-50/80"}`}>
          {live ? "Jump in live →" : soon ? "Be there at the open →" : "Open stream →"}
        </span>
      </div>
    </Link>
  );
}
