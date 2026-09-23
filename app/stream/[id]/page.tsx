"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageBack } from "@/components/PageBack";
import { categoryLabel, sellerBySlug } from "@/lib/catalog";
import { isVerifiedLiveUrl, isWatchPlatform, outboundCta, platformLabel } from "@/lib/platforms";
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
    return (
      <div className="space-y-6">
        <PageBack href="/tonight" label="Back to tonight" trail={[{ href: "/guide", label: "Guide" }, { href: "/search", label: "Search" }]} />
        <h1 className="font-display text-4xl">Stream not found.</h1>
        <p className="text-paper-200/65">That show is not on the calendar any more. Browse tonight or search for the seller.</p>
      </div>
    );
  }

  const seller = sellerBySlug(stream.sellerSlug);
  const opp = opportunity(stream, user);
  const saved = user?.favorites.includes(stream.id);
  const verifiedRoom = isVerifiedLiveUrl(stream.url);
  const live = stream.status === "live";

  return (
    <article className="space-y-10">
      <PageBack
        href={isWatchPlatform(stream.platform) ? "/watch" : `/live/${stream.category}`}
        label={isWatchPlatform(stream.platform) ? "Back to Watch live" : `Back to ${categoryLabel(stream.category)}`}
        trail={
          isWatchPlatform(stream.platform)
            ? [
                { href: `/live/${stream.platform}`, label: platformLabel(stream.platform) },
                { href: `/seller/${stream.sellerSlug}`, label: seller?.name ?? "Creator" },
              ]
            : [
                { href: "/guide", label: "Guide" },
                { href: "/tonight", label: "Tonight" },
                { href: "/items", label: "Items" },
                { href: `/seller/${stream.sellerSlug}`, label: seller?.name ?? "Seller" },
              ]
        }
      />
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
          <p className={`mt-4 font-mono text-4xl tabular-nums ${live ? "text-live" : "text-gold"}`}>
            {live && verifiedRoom
              ? formatElapsed(-msUntil(stream.startsAt, clock))
              : live
                ? "Live"
                : formatCountdown(msUntil(stream.startsAt, clock))}
            <span className="ml-3 text-sm uppercase tracking-[0.16em] text-paper-200/45">
              {live && verifiedRoom ? "on air" : live ? "on the board" : "until start"}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={stream.url} target="_blank" rel="noopener noreferrer" className="btn-live">
              {outboundCta(stream.platform, { live, url: stream.url })}
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
            {verifiedRoom
              ? `Opens this exact ${platformLabel(stream.platform)} room. We do not host the stream.`
              : `Sends you to ${platformLabel(stream.platform)} to find the room that is actually on. We do not host the stream.`}
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

      {isWatchPlatform(stream.platform) ? (
      <section className="rounded-2xl border border-white/8 bg-ink-900 p-6">
        <h2 className="font-display text-3xl">Watch live</h2>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          This is not a shop. There is no item calendar and no lots. Jump in on {platformLabel(stream.platform)} to watch the room that is on.
        </p>
      </section>
      ) : (
      <section>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">
            {stream.items.some((item) => item.source === "ebay-seller") ? "Listed by this seller" : "Deal intelligence"}
          </h2>
          {stream.items.some((item) => item.source === "ebay-seller") ? (
            <Link href="/items" className="text-sm text-gold">
              Item calendar
            </Link>
          ) : !user || user.plan === "free" ? (
            <Link href="/pricing" className="text-sm text-gold">
              Unlock full market snapshots on Pro
            </Link>
          ) : null}
        </div>
        {!stream.items.length ? (
          <div className="mt-5 rounded-2xl border border-white/8 bg-ink-900 p-6">
            <p className="font-display text-2xl">No posted listings yet</p>
            <p className="mt-2 text-sm text-paper-200/65">
              {verifiedRoom
                ? "This room is real. The seller has not published shop stock we can open, so we are not inventing lots. Jump in on the platform to see what comes up on camera."
                : "Inventory for this slot has not been confirmed."}
            </p>
          </div>
        ) : (
        <>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-800 font-mono text-[10px] uppercase tracking-[0.14em] text-paper-200/50">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Listed</th>
                {stream.items.some((item) => item.source === "ebay-seller") ? (
                  <th className="px-4 py-3">Listing</th>
                ) : (
                  <>
                    <th className="px-4 py-3">Recent median</th>
                    <th className="px-4 py-3">Range</th>
                    <th className="px-4 py-3">Deal</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {stream.items.map((item) => {
                const delta = dealPct(item);
                const comps = comparables(item);
                const real = item.source === "ebay-seller";
                return (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-paper-200/45">
                        {[item.set, item.grade].filter(Boolean).join(" · ") || "eBay listing"}
                      </p>
                      {!real && user && user.plan !== "free" && comps[0] && (
                        <p className="mt-1 text-[11px] text-signal">
                          Also tonight/this week: {gbp(comps[0].item.startingPrice)} on {platformLabel(comps[0].stream.platform, "short")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{gbp(item.currentPrice ?? item.startingPrice)}</td>
                    {real ? (
                      <td className="px-4 py-3">
                        {item.listingUrl ? (
                          <a href={item.listingUrl} target="_blank" rel="noopener noreferrer" className="text-teal hover:text-paper-50">
                            Open on eBay
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">{user?.plan === "collector" ? gbp(item.marketMedian) : user ? gbp(item.marketMedian) : "—"}</td>
                        <td className="px-4 py-3 text-paper-200/55">
                          {user && user.plan !== "free" ? `${gbp(item.marketLow)}–${gbp(item.marketHigh)}` : "Pro"}
                        </td>
                        <td className={`px-4 py-3 ${delta < 0 ? "text-teal" : "text-paper-200/60"}`}>{pct(delta)}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-paper-200/40">
          {stream.items.some((item) => item.source === "ebay-seller")
            ? "These are the seller’s current eBay listings, not a guaranteed live-show queue. Jump into the room for what is on camera."
            : "Market information, not a buy recommendation. Comparables are prototype estimates from recent sold ranges."}
        </p>
        </>
        )}
      </section>
      )}
    </article>
  );
}
