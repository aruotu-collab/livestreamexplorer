"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { categoryLabel, isCategorySlug, sellerBySlug } from "@/lib/catalog";
import {
  BANDS,
  bandFor,
  byGuidePriority,
  categoryCounts,
  formatGuideDate,
  guideDates,
  localDayKey,
  platformCounts,
  visibleGuideSlot,
} from "@/lib/guide";
import { useLiveFeed } from "@/lib/live-feed";
import { isPlatformSlug, platformLabel } from "@/lib/platforms";
import { useStore } from "@/lib/store";
import { byStartTime, formatClock, isToday, msUntil } from "@/lib/time";
import type { Stream } from "@/lib/types";

const CELL_LIMIT = 4;

export default function GuidePage() {
  return (
    <Suspense fallback={<GuideFallback />}>
      <GuideGrid />
    </Suspense>
  );
}

function GuideFallback() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">TV listings for live shopping</p>
        <h1 className="mt-2 font-display text-5xl">The Guide</h1>
      </header>
    </div>
  );
}

function GuideGrid() {
  const { user } = useStore();
  const { catalog, clock, timeZone } = useLiveFeed();
  const searchParams = useSearchParams();
  const platformParam = searchParams.get("platform") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const platform = isPlatformSlug(platformParam) ? platformParam : "all";
  const category = isCategorySlug(categoryParam) ? categoryParam : "all";
  const [cellOpen, setCellOpen] = useState<Record<string, boolean>>({});
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setCellOpen({});
  }, [platform, category]);

  useEffect(() => {
    if (!pendingScroll) return;
    const node = cellRefs.current[pendingScroll];
    setPendingScroll(null);
    node?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [pendingScroll, cellOpen]);

  const days = useMemo(() => guideDates(clock), [clock]);
  const interest = new Set(user?.interests ?? []);

  const filtered = useMemo(() => {
    return catalog
      .filter((stream) => {
        if (platform !== "all" && stream.platform !== platform) return false;
        if (category !== "all" && stream.category !== category) return false;
        return true;
      })
      .sort(byStartTime);
  }, [catalog, platform, category]);

  const byDay = useMemo(() => {
    const map = new Map<string, Stream[]>();
    for (const date of days) map.set(localDayKey(date, timeZone), []);
    for (const stream of filtered) {
      const key = localDayKey(stream.startsAt, timeZone);
      map.get(key)?.push(stream);
    }
    return map;
  }, [days, filtered, timeZone]);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">TV listings for live shopping</p>
        <h1 className="mt-2 font-display text-5xl">The Guide</h1>
        <p className="mt-3 text-paper-200/65">
          Fourteen days, four dayparts. Scan when rooms open the way you would scan a TV guide — then jump out to eBay Live or Whatnot.
        </p>
      </header>

      <p className="font-mono text-xs text-paper-200/45">
        {filtered.filter((stream) => byDay.has(localDayKey(stream.startsAt, timeZone))).length} listings on the grid
        {platform !== "all" ? ` · ${platformLabel(platform)}` : ""}
        {category !== "all" ? ` · ${categoryLabel(category)}` : ""}
        {user ? " · gold edge = matches your hunt" : ""}
      </p>

      <div className="overflow-x-auto category-scroll rounded-3xl border border-white/8 bg-ink-900/70">
        <div className="min-w-[860px]">
          <div className="sticky top-0 z-10 flex border-b border-white/8 bg-ink-900">
            <div className="w-36 shrink-0 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/40">
              Date
            </div>
            {BANDS.map((band) => (
              <div key={band.id} className="min-w-[160px] flex-1 border-l border-white/8 px-3 py-3">
                <p className="font-display text-lg leading-none">{band.label}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/40">{band.hint}</p>
              </div>
            ))}
          </div>
          {days.map((date) => {
            const key = localDayKey(date, timeZone);
            const shows = byDay.get(key) ?? [];
            const today = isToday(date.toISOString(), clock, timeZone);
            const cats = categoryCounts(shows);
            const plats = platformCounts(shows);
            const liveCount = shows.filter((stream) => stream.status === "live").length;
            const soonCount = shows.filter((stream) => stream.status === "soon").length;
            const endedCount = shows.filter((stream) => stream.status === "ended").length;

            return (
              <div
                key={key}
                className={`flex border-t border-white/6 first:border-t-0 ${
                  today ? "bg-gold/5" : "bg-transparent"
                }`}
              >
                <div className="flex w-36 shrink-0 flex-col items-start px-4 py-4 text-left">
                  {today ? (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Today</p>
                  ) : (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/40">
                      {formatGuideDate(date, timeZone).weekday}
                    </p>
                  )}
                  <p className="mt-1 font-display text-2xl leading-none">{formatGuideDate(date, timeZone).day}</p>
                  <p className="mt-2 text-[11px] text-paper-200/50">
                    {shows.length ? `${shows.length} show${shows.length === 1 ? "" : "s"}` : "Quiet"}
                    {!today && liveCount ? ` · ${liveCount} live` : ""}
                  </p>
                  {today && (liveCount || soonCount || endedCount) ? (
                    <p className="mt-1 text-[11px] leading-5 text-paper-200/50">
                      {[
                        liveCount ? `${liveCount} live` : null,
                        soonCount ? `${soonCount} soon` : null,
                        endedCount ? `${endedCount} ended` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {cats.length > 0 && (
                    <p className="mt-2 text-[11px] leading-5 text-paper-200/45">
                      {cats.slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ")}
                    </p>
                  )}
                  {plats.length > 0 && (
                    <p className="text-[11px] leading-5 text-teal/70">
                      {plats.map(([label, count]) => `${label} (${count})`).join(" · ")}
                    </p>
                  )}
                </div>

                {BANDS.map((band) => {
                  const slot = shows
                    .filter((stream) => bandFor(stream.startsAt, timeZone) === band.id)
                    .sort(byGuidePriority);
                  const cellKey = `${key}-${band.id}`;
                  const cellExpanded = cellOpen[cellKey] ?? false;
                  const visible = visibleGuideSlot(slot, cellExpanded, CELL_LIMIT);
                  const canToggleCell = slot.length > visible.length || (cellExpanded && slot.length > CELL_LIMIT);
                  return (
                    <div
                      key={band.id}
                      ref={(node) => {
                        cellRefs.current[cellKey] = node;
                      }}
                      className="min-w-[160px] flex-1 scroll-mt-64 space-y-2 border-l border-white/6 px-2 py-3"
                    >
                      {slot.length === 0 ? (
                        <p className="px-1 py-6 text-center text-[11px] text-paper-200/25">—</p>
                      ) : (
                        visible.map((stream) => (
                          <Programme key={stream.id} stream={stream} watched={interest.has(stream.category)} />
                        ))
                      )}
                      {canToggleCell && (
                        <button
                          type="button"
                          aria-expanded={cellExpanded}
                          onClick={() => {
                            const next = !cellExpanded;
                            setCellOpen((current) => ({ ...current, [cellKey]: next }));
                            if (!next) setPendingScroll(cellKey);
                          }}
                          className="w-full rounded-lg px-2 py-1 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-gold/80 hover:text-gold"
                        >
                          {cellExpanded ? "Collapse" : `Expand · +${slot.length - CELL_LIMIT} more`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatSoonIn(iso: string, at: Date) {
  const ms = Math.max(0, msUntil(iso, at));
  const minutes = Math.round(ms / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  if (minutes > 0) return `${minutes}m`;
  return `${Math.max(1, Math.round(ms / 1000))}s`;
}

function Programme({ stream, watched }: { stream: Stream; watched: boolean }) {
  const { clock, timeZone } = useLiveFeed();
  const seller = sellerBySlug(stream.sellerSlug);
  const live = stream.status === "live";
  const soon = stream.status === "soon";
  const ended = stream.status === "ended";
  const time = formatClock(stream.startsAt, timeZone);

  return (
    <div
      className={`rounded-xl border px-2.5 py-2 ${
        ended
          ? "border-white/6 bg-ink-800/40 opacity-45"
          : `transition hover:-translate-y-px ${
              live
                ? "border-live/45 bg-live/10"
                : soon
                  ? "border-gold/45 bg-gold/15 shadow-glow"
                  : watched
                    ? "border-gold/25 bg-ink-800"
                    : "border-white/8 bg-ink-800/80 hover:border-white/20"
            }`
      }`}
    >
    <Link href={`/stream/${stream.id}`} className="block">
      <div className="flex items-center gap-1.5">
        {live ? <span className="pulse-live h-1.5 w-1.5 rounded-full bg-live" /> : null}
        {soon ? <span className="pulse-live h-1.5 w-1.5 rounded-full bg-gold" /> : null}
        <span
          className={`font-mono text-[10px] tabular-nums ${
            live ? "text-live" : soon ? "text-gold" : ended ? "text-paper-200/50" : "text-paper-200/55"
          }`}
        >
          {ended ? `Ended · ${time}` : soon ? `Soon · ${time}` : time}
        </span>
        {soon ? (
          <span className="font-mono text-[10px] tabular-nums text-gold">{formatSoonIn(stream.startsAt, clock)}</span>
        ) : null}
        <span className="text-[10px] uppercase tracking-wide text-paper-200/40">
          {platformLabel(stream.platform, "short")}
        </span>
      </div>
      <p className={`mt-1 truncate text-sm leading-tight ${ended ? "text-paper-200/70" : "text-paper-50"}`}>
        {stream.title}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-paper-200/45">
        {categoryLabel(stream.category)}
        {seller ? ` · ${seller.name}` : ""}
      </p>
    </Link>
      {ended ? null : (
        <a
          href={stream.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-1.5 inline-block text-[11px] ${live ? "text-live" : soon ? "text-gold" : "text-paper-50/80"}`}
        >
          Open on {platformLabel(stream.platform, "short")}
        </a>
      )}
    </div>
  );
}
