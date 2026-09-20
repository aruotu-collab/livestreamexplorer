"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { useLiveFeed } from "@/lib/live-feed";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Live now" },
  { href: "/calendar", label: "7-day" },
  { href: "/tonight", label: "Tonight" },
  { href: "/agents", label: "Agents" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/collection", label: "Collection" },
  { href: "/pricing", label: "Pro" },
];

const PLATFORMS = [
  { href: "/live/ebay", label: "eBay Live" },
  { href: "/live/whatnot", label: "Whatnot" },
];

function pathMatches(path: string, href: string) {
  const current = path.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  return current === target;
}

export function Header() {
  const path = usePathname();
  const { user, hydrated } = useStore();
  const { live } = useLiveFeed();
  const counts = live.reduce((map, stream) => {
    map.set(stream.category, (map.get(stream.category) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const categoryRow = useRef<HTMLElement>(null);

  useEffect(() => {
    categoryRow.current?.querySelector<HTMLElement>("[aria-current='page']")?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [path]);

  useEffect(() => {
    const row = categoryRow.current;
    if (!row) return;
    const onWheel = (event: WheelEvent) => {
      if (row.scrollWidth <= row.clientWidth) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    };
    row.addEventListener("wheel", onWheel, { passive: false });
    return () => row.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathMatches(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm ${active ? "bg-ink-700 text-paper-50" : "text-paper-200/70 hover:text-paper-50"}`}
              >
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
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${pathMatches(path, item.href) ? "bg-ink-700 text-paper-50" : "text-paper-200/60"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <nav ref={categoryRow} className="category-scroll flex gap-2 border-t border-white/5 px-4 py-2">
        {CATEGORIES.map((cat) => {
          const href = `/live/${cat.slug}`;
          const active = pathMatches(path, href);
          const count = counts.get(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`chip shrink-0 ${
                active
                  ? "border-gold bg-gold text-ink-950"
                  : "hover:border-gold/40"
              }`}
            >
              {cat.label}
              {count ? <span className={active ? "text-ink-950" : "text-gold/80"}>{count}</span> : null}
            </Link>
          );
        })}
        {PLATFORMS.map((item) => {
          const active = pathMatches(path, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`chip shrink-0 ${
                active ? "border-teal bg-teal text-ink-950" : "hover:border-gold/40"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
