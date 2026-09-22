"use client";

import Link from "next/link";
import { categoryLabel, sellerBySlug } from "@/lib/catalog";
import { outboundCta, platformLabel } from "@/lib/platforms";
import { useOptionalFeed } from "@/lib/live-feed";
import { formatWhen, gbp } from "@/lib/time";
import type { LiveLot } from "@/lib/types";

export function ItemCard({ lot }: { lot: LiveLot }) {
  const feed = useOptionalFeed();
  const clock = feed?.clock;
  const timeZone = feed?.timeZone;
  const seller = sellerBySlug(lot.stream.sellerSlug);
  const live = lot.stream.status === "live";

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border bg-ink-900/80 ${
      live ? "border-live/30" : "border-white/8"
    }`}>
      <div className="flex flex-1 flex-col gap-2 px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {live ? (
            <span className="chip border-live/50 bg-live/20 text-live">
              <span className="pulse-live h-1.5 w-1.5 rounded-full bg-live" /> Live
            </span>
          ) : (
            <span className="chip">{formatWhen(lot.stream.startsAt, clock, timeZone)}</span>
          )}
          <span className="chip">{platformLabel(lot.stream.platform, "short")}</span>
          <span className="chip">{categoryLabel(lot.item.category)}</span>
        </div>
        <h3 className="font-display text-[1.2rem] leading-tight">{lot.item.title}</h3>
        <p className="font-mono text-2xl tabular-nums text-gold">{gbp(lot.item.currentPrice ?? lot.item.startingPrice)}</p>
        <p className="text-sm text-paper-200/60">
          {seller?.name ?? "eBay seller"}
          {lot.item.grade ? ` · ${lot.item.grade}` : ""}
        </p>
        <p className="text-xs text-paper-200/45">
          Listed by this seller · {lot.stream.title}
        </p>
        <Link href={`/stream/${lot.stream.id}`} className="text-sm text-paper-50/80 hover:text-gold">
          Open show →
        </Link>
      </div>
      <div className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
        {lot.item.listingUrl ? (
          <a href={lot.item.listingUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
            Open listing
          </a>
        ) : null}
        <a
          href={lot.stream.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${live ? "btn-live" : "btn-ghost"} w-full ${lot.item.listingUrl ? "" : "sm:col-span-2"}`}
        >
          {outboundCta(lot.stream.platform, { live, url: lot.stream.url })}
        </a>
      </div>
    </article>
  );
}
