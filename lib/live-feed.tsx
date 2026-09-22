"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ALL_STREAMS } from "./catalog";
import { registerIndexedSellers } from "./live-index";
import { APP_NOW, byStartTime, hourInZone, localDayStamp, withStatus } from "./time";
import { DEFAULT_TIME_ZONE, countryForTimeZone, detectTimeZone } from "./zone";
import type { LiveLot, Seller, Stream } from "./types";

type ScanState = {
  sweeps: number;
  found: number;
  lastFound: Stream | null;
  lastSweepAt: string;
  hunting: boolean;
};

type Feed = {
  clock: Date;
  timeZone: string;
  zoneLabel: string;
  discovered: Stream[];
  catalog: Stream[];
  live: Stream[];
  soon: Stream[];
  upcoming: Stream[];
  tonight: Stream[];
  week: Stream[];
  lots: LiveLot[];
  scan: ScanState;
};

const Ctx = createContext<Feed | null>(null);

export function LiveFeedProvider({ children }: { children: React.ReactNode }) {
  const [clock, setClock] = useState(() => (typeof window === "undefined" ? APP_NOW : new Date()));
  const [timeZone, setTimeZone] = useState(() => (typeof window === "undefined" ? DEFAULT_TIME_ZONE : detectTimeZone()));
  const [indexed, setIndexed] = useState<Stream[]>([]);
  const [discovered, setDiscovered] = useState<Stream[]>([]);
  const seenIds = useRef(new Set<string>());
  const primed = useRef(false);
  const [scan, setScan] = useState<ScanState>({
    sweeps: 0,
    found: 0,
    lastFound: null,
    lastSweepAt: APP_NOW.toISOString(),
    hunting: true,
  });

  useEffect(() => {
    setTimeZone(detectTimeZone());
    setClock(new Date());
    const tick = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const nowClock = new Date();
      try {
        const res = await fetch("/api/live/rooms", { cache: "no-store" });
        const data = (await res.json()) as { streams?: Stream[]; sellers?: Seller[] };
        if (cancelled) return;
        const rooms = data.streams ?? [];
        registerIndexedSellers(data.sellers ?? []);
        const liveRooms = rooms.filter((room) => room.status === "live");
        const fresh = primed.current ? liveRooms.filter((room) => !seenIds.current.has(room.id)) : [];
        for (const room of liveRooms) seenIds.current.add(room.id);
        primed.current = true;
        setIndexed(rooms);
        void fetch("/api/live/lots", { cache: "no-store" })
          .then((lotRes) => lotRes.json())
          .then((lotData: { streams?: Stream[] }) => {
            if (cancelled || !lotData.streams?.length) return;
            setIndexed((current) => {
              const extras = new Map(lotData.streams!.map((stream) => [stream.id, stream]));
              const merged = current.map((stream) => extras.get(stream.id) ?? stream);
              for (const stream of lotData.streams!) {
                if (!merged.some((item) => item.id === stream.id)) merged.push(stream);
              }
              return merged;
            });
          })
          .catch(() => undefined);
        if (fresh.length) {
          const spotted = fresh.map((room) => ({
            ...room,
            unscheduled: true,
            discoveredAt: nowClock.toISOString(),
          }));
          setDiscovered((current) => [...spotted, ...current].slice(0, 18));
        }
        setScan((current) => ({
          sweeps: current.sweeps + 1,
          found: current.found + fresh.length,
          lastFound: fresh[0] ?? current.lastFound,
          lastSweepAt: nowClock.toISOString(),
          hunting: true,
        }));
      } catch {
        if (cancelled) return;
        setScan((current) => ({
          ...current,
          sweeps: current.sweeps + 1,
          lastSweepAt: nowClock.toISOString(),
          hunting: true,
        }));
      }
    };

    void load();
    const loop = window.setInterval(() => void load(), 90_000);
    return () => {
      cancelled = true;
      window.clearInterval(loop);
    };
  }, []);

  const value = useMemo<Feed>(() => {
    const indexedNow = indexed.map((stream) => withStatus(stream, clock));
    const live = indexedNow
      .filter((stream) => stream.status === "live")
      .sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0));
    const hasEbayIndex = indexedNow.some((stream) => stream.platform === "ebay");
    const calendar = ALL_STREAMS.map((stream) => withStatus(stream, clock)).filter((stream) => {
      if (stream.status === "live") return false;
      if (hasEbayIndex && stream.platform === "ebay") return false;
      return true;
    });
    const merged = [
      ...indexedNow.filter((stream) => stream.status !== "ended"),
      ...discovered.filter((stream) => !indexedNow.some((item) => item.id === stream.id)),
      ...calendar,
    ];
    const active = merged.filter((stream) => stream.status !== "ended");
    const upcoming = active
      .filter((stream) => stream.status === "soon" || stream.status === "upcoming")
      .sort(byStartTime);
    const soon = upcoming.filter((stream) => stream.status === "soon");
    const tonight = upcoming
      .filter((stream) => {
        return localDayStamp(new Date(stream.startsAt), timeZone) === localDayStamp(clock, timeZone) && hourInZone(stream.startsAt, timeZone) >= 17;
      })
      .sort(byStartTime);
    const lots: LiveLot[] = indexedNow.flatMap((stream) =>
      stream.items
        .filter((item) => item.source === "ebay-seller" && item.listingUrl)
        .map((item) => ({ item, stream })),
    );
    return {
      clock,
      timeZone,
      zoneLabel: countryForTimeZone(timeZone),
      discovered,
      catalog: merged,
      live,
      soon,
      upcoming,
      tonight,
      week: [...live, ...upcoming],
      lots,
      scan,
    };
  }, [clock, discovered, indexed, scan, timeZone]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLiveFeed() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLiveFeed must be used within LiveFeedProvider");
  return ctx;
}

export function useOptionalFeed() {
  return useContext(Ctx);
}
