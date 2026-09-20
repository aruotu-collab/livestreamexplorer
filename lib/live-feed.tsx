"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ALL_STREAMS, createSurpriseStream } from "./catalog";
import { APP_NOW, byStartTime, hourInZone, localDayStamp, withStatus } from "./time";
import { DEFAULT_TIME_ZONE, countryForTimeZone, detectTimeZone } from "./zone";
import type { Stream } from "./types";

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
  scan: ScanState;
};

const Ctx = createContext<Feed | null>(null);

export function LiveFeedProvider({ children }: { children: React.ReactNode }) {
  const [clock, setClock] = useState(() => (typeof window === "undefined" ? APP_NOW : new Date()));
  const [timeZone, setTimeZone] = useState(() => (typeof window === "undefined" ? DEFAULT_TIME_ZONE : detectTimeZone()));
  const [discovered, setDiscovered] = useState<Stream[]>([]);
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
    let seq = 0;
    const clockNow = () => new Date();

    const sweep = () => {
      seq += 1;
      const nowClock = clockNow();
      const hit = seq === 1 || Math.random() > 0.22;
      if (hit) {
        const stream = createSurpriseStream(nowClock, seq);
        setDiscovered((current) => [stream, ...current].slice(0, 18));
        setScan((current) => ({
          sweeps: current.sweeps + 1,
          found: current.found + 1,
          lastFound: stream,
          lastSweepAt: nowClock.toISOString(),
          hunting: true,
        }));
        return;
      }
      setScan((current) => ({
        ...current,
        sweeps: current.sweeps + 1,
        lastSweepAt: nowClock.toISOString(),
        hunting: true,
      }));
    };

    const first = window.setTimeout(sweep, 5000);
    const loop = window.setInterval(sweep, 17000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
    };
  }, []);

  const value = useMemo<Feed>(() => {
    const merged = [...discovered, ...ALL_STREAMS].map((stream) => withStatus(stream, clock));
    const active = merged.filter((stream) => stream.status !== "ended");
    const live = active.filter((stream) => stream.status === "live").sort(byStartTime);
    const upcoming = active
      .filter((stream) => stream.status === "soon" || stream.status === "upcoming")
      .sort(byStartTime);
    const soon = upcoming.filter((stream) => stream.status === "soon");
    const tonight = upcoming
      .filter((stream) => {
        return localDayStamp(new Date(stream.startsAt), timeZone) === localDayStamp(clock, timeZone) && hourInZone(stream.startsAt, timeZone) >= 17;
      })
      .sort(byStartTime);
    const week = [...live, ...upcoming];
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
      week,
      scan,
    };
  }, [clock, discovered, scan, timeZone]);

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
