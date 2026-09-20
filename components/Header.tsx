"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { CATEGORIES, isCategorySlug } from "@/lib/catalog";
import { useLiveFeed } from "@/lib/live-feed";
import { PLATFORMS, isPlatformSlug, platformBySlug } from "@/lib/platforms";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { formatZoneClock } from "@/lib/zone";
import type { Category, Platform } from "@/lib/types";

const NAV = [
  { href: "/guide", label: "Guide", icon: "calendar" as const },
  { href: "/tonight", label: "Tonight" },
  { href: "/agents", label: "Agents" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/collection", label: "Collection" },
];

function pathMatches(path: string, href: string) {
  const current = path.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  return current === target;
}

function guideHref(platform?: Platform | "all", category?: Category | "all") {
  const params = new URLSearchParams();
  if (platform && platform !== "all") params.set("platform", platform);
  if (category && category !== "all") params.set("category", category);
  const query = params.toString();
  return query ? `/guide?${query}` : "/guide";
}

function CalendarMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <rect x="1.75" y="2.75" width="12.5" height="11.5" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M1.75 6.25h12.5M5 1.5v2.75M11 1.5v2.75" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 9h1.4M7.8 9h1.4M10.6 9h1.4M5 11.4h1.4M7.8 11.4h1.4" fill="currentColor" />
    </svg>
  );
}

export function Header() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const { user, hydrated } = useStore();
  const { live, catalog, clock, timeZone, zoneLabel } = useLiveFeed();
  const platformRow = useRef<HTMLElement>(null);
  const categoryRow = useRef<HTMLElement>(null);
  const onGuide = pathMatches(path, "/guide");
  const currentSlug = path.replace(/^\/live\//, "").replace(/\/$/, "");
  const routePlatform = platformBySlug(currentSlug);
  const platformParam = searchParams.get("platform") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const guidePlatform = onGuide && isPlatformSlug(platformParam) ? platformParam : undefined;
  const guideCategory = onGuide && isCategorySlug(categoryParam) ? categoryParam : undefined;
  const activePlatform = onGuide ? (guidePlatform ? platformBySlug(guidePlatform) : undefined) : routePlatform;
  const allPlatformsActive = onGuide
    ? !guidePlatform
    : pathMatches(path, "/") ||
      pathMatches(path, "/tonight") ||
      pathMatches(path, "/calendar") ||
      (path.startsWith("/live/") && !routePlatform);
  const countSource = onGuide
    ? catalog.filter((stream) => !guidePlatform || stream.platform === guidePlatform)
    : live;
  const counts = countSource.reduce((map, stream) => {
    map.set(stream.category, (map.get(stream.category) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  useEffect(() => {
    const row = activePlatform ? platformRow.current : categoryRow.current;
    row?.querySelector<HTMLElement>("[aria-current='page']")?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [path, activePlatform, guideCategory]);

  useEffect(() => {
    const rows = [platformRow.current, categoryRow.current].filter(Boolean) as HTMLElement[];
    const onWheel = (event: WheelEvent) => {
      const row = event.currentTarget as HTMLElement;
      if (row.scrollWidth <= row.clientWidth) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    };
    rows.forEach((row) => row.addEventListener("wheel", onWheel, { passive: false }));
    return () => rows.forEach((row) => row.removeEventListener("wheel", onWheel));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          <Logo region={zoneLabel} time={formatZoneClock(clock, timeZone)} />
        </Link>
        <nav className="hidden flex-wrap items-center justify-end gap-0.5 lg:flex">
          {NAV.map((item) => {
            const active = pathMatches(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm ${
                  active ? "bg-ink-700 text-paper-50" : "text-paper-200/70 hover:text-paper-50"
                }`}
              >
                {item.icon === "calendar" ? <CalendarMark /> : null}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/search" className="btn-ghost hidden sm:inline-flex">
            Search
          </Link>
          {hydrated && user ? (
            <Link href="/account" className="btn-gold">
              {user.name} · {user.plan}
            </Link>
          ) : (
            <Link href="/signup" className="btn-gold">
              Create free agent
            </Link>
          )}
        </div>
      </div>
      <nav className="hide-scroll flex gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 lg:hidden">
        {NAV.map((item) => {
          const active = pathMatches(path, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs ${
                active ? "bg-ink-700 text-paper-50" : "text-paper-200/60"
              }`}
            >
              {item.icon === "calendar" ? <CalendarMark /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav ref={platformRow} className="category-scroll flex gap-2 border-t border-white/5 px-4 py-2">
        <Link
          href={onGuide ? guideHref("all", guideCategory) : "/"}
          aria-current={allPlatformsActive ? "page" : undefined}
          className={`chip shrink-0 ${
            allPlatformsActive ? "border-teal bg-teal text-ink-950" : "hover:border-teal/40"
          }`}
        >
          All platforms
        </Link>
        {PLATFORMS.map((platform) => {
          const href = onGuide ? guideHref(platform.slug, guideCategory) : `/live/${platform.slug}`;
          const active = onGuide ? guidePlatform === platform.slug : pathMatches(path, `/live/${platform.slug}`);
          const soon = platform.status === "coming-soon";
          return (
            <Link
              key={platform.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`chip shrink-0 ${
                active
                  ? "border-teal bg-teal text-ink-950"
                  : soon
                    ? "border-dashed text-paper-200/55 hover:border-teal/40"
                    : "hover:border-teal/40"
              }`}
            >
              {platform.label}
              {soon ? <span className={active ? "text-ink-950" : "text-paper-200/40"}>Soon</span> : null}
            </Link>
          );
        })}
      </nav>
      <nav ref={categoryRow} className="category-scroll flex gap-2 border-t border-white/5 px-4 py-2">
        {onGuide ? (
          <Link
            href={guideHref(guidePlatform, "all")}
            aria-current={!guideCategory ? "page" : undefined}
            className={`chip shrink-0 ${
              !guideCategory ? "border-gold bg-gold text-ink-950" : "hover:border-gold/40"
            }`}
          >
            All categories
          </Link>
        ) : null}
        {CATEGORIES.map((cat) => {
          const href = onGuide ? guideHref(guidePlatform, cat.slug) : `/live/${cat.slug}`;
          const active = onGuide ? guideCategory === cat.slug : pathMatches(path, `/live/${cat.slug}`);
          const count = counts.get(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`chip shrink-0 ${
                active ? "border-gold bg-gold text-ink-950" : "hover:border-gold/40"
              }`}
            >
              {cat.label}
              {count ? <span className={active ? "text-ink-950" : "text-gold/80"}>{count}</span> : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
