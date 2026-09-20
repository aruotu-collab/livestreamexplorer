"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ALL_STREAMS, createSurpriseStream } from "./catalog";
import { APP_NOW, withStatus } from "./time";
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
  discovered: Stream[];
  catalog: Stream[];
  live: Stream[];
  soon: Stream[];
  tonight: Stream[];
  week: Stream[];
  scan: ScanState;
};

const Ctx = createContext<Feed | null>(null);

export function LiveFeedProvider({ children }: { children: React.ReactNode }) {
  const [offset, setOffset] = useState(0);
  const [discovered, setDiscovered] = useState<Stream[]>([]);
  const [scan, setScan] = useState<ScanState>({
    sweeps: 0,
    found: 0,
    lastFound: null,
    lastSweepAt: APP_NOW.toISOString(),
    hunting: true,
  });

  useEffect(() => {
    const started = Date.now();
    const tick = window.setInterval(() => setOffset(Date.now() - started), 1000);
    return () => window.clearInterval(tick);
  }, []);

  const clock = useMemo(() => new Date(APP_NOW.getTime() + offset), [offset]);

  useEffect(() => {
    let seq = 0;
    const startedAt = Date.now();
    const clockNow = () => new Date(APP_NOW.getTime() + (Date.now() - startedAt));

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
    const live = active.filter((stream) => stream.status === "live").sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0));
    const soon = active
      .filter((stream) => stream.status === "soon")
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    const tonight = active
      .filter((stream) => {
        const date = new Date(stream.startsAt);
        return date.toDateString() === clock.toDateString() && date.getHours() >= 17;
      })
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    const week = active.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    return { clock, discovered, catalog: merged, live, soon, tonight, week, scan };
  }, [clock, discovered, scan]);

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
