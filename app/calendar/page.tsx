"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { LIVE_PLATFORMS } from "@/lib/platforms";
import { useLiveFeed } from "@/lib/live-feed";
import { useStore } from "@/lib/store";
import { byStartTime, dayKey, formatDay, isToday, isTomorrow, isWeekend } from "@/lib/time";
import type { Category, Platform } from "@/lib/types";
import { BrowseLinks, PageBack } from "@/components/PageBack";
import { StreamCard } from "@/components/StreamCard";

const DAYS = ["today", "tomorrow", "weekend", "7days"] as const;

export default function CalendarPage() {
  const { user } = useStore();
  const { week, clock, timeZone } = useLiveFeed();
  const [day, setDay] = useState<(typeof DAYS)[number]>("7days");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    return week.filter((stream) => {
      if (platform !== "all" && stream.platform !== platform) return false;
      if (category !== "all" && stream.category !== category) return false;
      if (day === "today" && !isToday(stream.startsAt, clock, timeZone)) return false;
      if (day === "tomorrow" && !isTomorrow(stream.startsAt, clock, timeZone)) return false;
      if (day === "weekend" && !isWeekend(stream.startsAt)) return false;
      return true;
    });
  }, [day, platform, category, week, clock, timeZone]);

  const groups = [...filtered].sort(byStartTime).reduce<Record<string, typeof filtered>>((acc, stream) => {
    const key = dayKey(stream.startsAt, timeZone);
    acc[key] = acc[key] || [];
    acc[key].push(stream);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <PageBack href="/tonight" label="Back to tonight" />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Free calendar</p>
        <h1 className="mt-2 font-display text-5xl">7-day livestream calendar</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          Filter by platform and day. Every card links out to the eBay event or Whatnot seller-show page. Intelligence lives one click deeper.
        </p>
        <div className="mt-4">
          <BrowseLinks current="calendar" />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {DAYS.map((value) => (
          <button key={value} onClick={() => setDay(value)} className={`chip capitalize ${day === value ? "border-gold/50 text-gold" : ""}`}>
            {value === "7days" ? "7 days" : value}
          </button>
        ))}
        <button onClick={() => setPlatform("all")} className={`chip ${platform === "all" ? "border-teal/50 text-teal" : ""}`}>
          All platforms
        </button>
        {LIVE_PLATFORMS.map((item) => (
          <button
            key={item.slug}
            onClick={() => setPlatform(item.slug)}
            className={`chip ${platform === item.slug ? "border-teal/50 text-teal" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCategory("all")} className={`chip ${category === "all" ? "border-paper-50/40" : ""}`}>
          All categories
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat.slug} onClick={() => setCategory(cat.slug)} className={`chip ${category === cat.slug ? "border-paper-50/40" : ""}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <p className="font-mono text-xs text-paper-200/45">{filtered.length} upcoming streams</p>

      {Object.entries(groups).map(([key, list]) => (
        <section key={key} className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl">{formatDay(list[0].startsAt, timeZone)}</h2>
            <p className="text-sm text-paper-200/45">{list.length} shows</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((stream) => (
              <StreamCard key={stream.id} stream={stream} user={user} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
