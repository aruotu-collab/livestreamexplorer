"use client";

import Link from "next/link";
import { sellerBySlug } from "@/lib/catalog";
import { livePlatformSentence, platformLabel } from "@/lib/platforms";
import { useLiveFeed } from "@/lib/live-feed";
import { formatWhen } from "@/lib/time";

export function ScannerBar() {
  const { scan, clock, discovered, timeZone } = useLiveFeed();
  const seller = scan.lastFound ? sellerBySlug(scan.lastFound.sellerSlug) : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-teal/20 bg-ink-900">
      <div className="relative px-5 py-4">
        <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal to-transparent" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
              <span className="pulse-live h-1.5 w-1.5 rounded-full bg-teal" />
              {scan.hunting ? "Scanning for unscheduled rooms" : "Scanner idle"}
            </p>
            <p className="mt-1 text-sm text-paper-200/70">
              Sellers go live without a calendar slot. We keep sweeping {livePlatformSentence()} for rooms that were not listed a minute ago.
            </p>
          </div>
          <div className="text-right font-mono text-[11px] text-paper-200/45">
            <p>{scan.sweeps} sweeps</p>
            <p>{scan.found} new shows found this session</p>
          </div>
        </div>
        {scan.lastFound && (
          <Link
            href={`/stream/${scan.lastFound.id}`}
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-teal/20 bg-ink-800/80 px-4 py-3 hover:border-teal/50"
          >
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal">Just spotted</p>
              <p className="font-display text-xl">{scan.lastFound.title}</p>
              <p className="text-sm text-paper-200/55">
                {seller?.name} · {platformLabel(scan.lastFound.platform)} · {formatWhen(scan.lastFound.startsAt, clock, timeZone)}
              </p>
            </div>
            <span className="text-sm text-teal">Open before it fills →</span>
          </Link>
        )}
      </div>
      {discovered.length > 1 && (
        <p className="border-t border-white/5 px-5 py-2 text-xs text-paper-200/40">
          {discovered.length} unscheduled shows picked up while you have been on the site.
        </p>
      )}
    </section>
  );
}
