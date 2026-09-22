"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { LIVE_PLATFORMS } from "@/lib/platforms";
import { useLiveFeed } from "@/lib/live-feed";
import { byStartTime, dayKey, formatDay, isToday, isTomorrow } from "@/lib/time";
import type { Category, Platform } from "@/lib/types";
import { BrowseLinks, PageBack } from "@/components/PageBack";
import { ItemCard } from "@/components/ItemCard";

export default function ItemsPage() {
  const { lots, clock, timeZone } = useLiveFeed();
  const [day, setDay] = useState<"live" | "today" | "tomorrow" | "all">("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const filtered = useMemo(() => {
    return lots.filter((lot) => {
      if (platform !== "all" && lot.stream.platform !== platform) return false;
      if (category !== "all" && lot.item.category !== category) return false;
      if (day === "live" && lot.stream.status !== "live") return false;
      if (day === "today" && !isToday(lot.stream.startsAt, clock, timeZone)) return false;
      if (day === "tomorrow" && !isTomorrow(lot.stream.startsAt, clock, timeZone)) return false;
      return true;
    });
  }, [lots, platform, category, day, clock, timeZone]);

  const groups = [...filtered].sort((a, b) => byStartTime(a.stream, b.stream)).reduce<Record<string, typeof filtered>>((acc, lot) => {
    const key = lot.stream.status === "live" ? "live" : dayKey(lot.stream.startsAt, timeZone);
    acc[key] = acc[key] || [];
    acc[key].push(lot);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <PageBack href="/" label="Back to home" trail={[{ href: "/calendar", label: "Show calendar" }, { href: "/tonight", label: "Tonight" }]} />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Item calendar</p>
        <h1 className="mt-2 font-display text-5xl">What is actually listed</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          Real eBay listings from sellers who are live or starting soon. Times follow the show. If a seller has not posted shop stock, we leave the row empty rather than inventing lots.
        </p>
        <div className="mt-4">
          <BrowseLinks current="items" />
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["all", "live", "today", "tomorrow"] as const).map((value) => (
          <button key={value} onClick={() => setDay(value)} className={`chip capitalize ${day === value ? "border-gold/50 text-gold" : ""}`}>
            {value === "all" ? "All times" : value === "live" ? "Live now" : value}
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

      <p className="font-mono text-xs text-paper-200/45">{filtered.length} listed items</p>

      {!filtered.length ? (
        <section className="rounded-2xl border border-white/8 bg-ink-900 p-6">
          <h2 className="font-display text-3xl">No posted listings yet</h2>
          <p className="mt-3 max-w-xl text-sm text-paper-200/65">
            We only show an item when we can open that exact eBay listing. Many live rooms add stock on camera. Check Live now, or open the room itself.
          </p>
        </section>
      ) : (
        Object.entries(groups).map(([key, list]) => (
          <section key={key} className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-3xl">
                {key === "live" ? "Live now" : formatDay(list[0].stream.startsAt, timeZone)}
              </h2>
              <p className="text-sm text-paper-200/45">{list.length} items</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((lot) => (
                <ItemCard key={`${lot.stream.id}-${lot.item.id}`} lot={lot} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
