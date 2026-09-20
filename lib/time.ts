import type { Stream, StreamStatus } from "./types";

export const APP_NOW = new Date("2026-09-20T13:49:00+01:00");

export function now() {
  if (typeof window === "undefined") return APP_NOW;
  return new Date();
}

export function withStatus(stream: Stream, at = now()): Stream {
  const start = new Date(stream.startsAt).getTime();
  const t = at.getTime();
  const liveWindow = 2.5 * 60 * 60 * 1000;
  let status: StreamStatus = "upcoming";
  if (t >= start && t < start + liveWindow) status = "live";
  else if (start > t && start - t <= 60 * 60 * 1000) status = "soon";
  else if (t >= start + liveWindow) status = "ended";
  return { ...stream, status };
}

export function formatWhen(iso: string, at = now(), timeZone?: string) {
  const date = new Date(iso);
  const sameDay = localDayStamp(date, timeZone) === localDayStamp(at, timeZone);
  const tomorrow = new Date(at);
  tomorrow.setDate(at.getDate() + 1);
  const time = formatClock(iso, timeZone);
  if (sameDay) return `Today · ${time}`;
  if (localDayStamp(date, timeZone) === localDayStamp(tomorrow, timeZone)) return `Tomorrow · ${time}`;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone }) + ` · ${time}`;
}

export function formatClock(iso: string | Date, timeZone?: string) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  return date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", timeZone });
}

export function formatDay(iso: string, timeZone?: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone });
}

export function localDayStamp(value: Date, timeZone?: string) {
  if (!timeZone) return value.toDateString();
  return value.toLocaleDateString("en-CA", { timeZone });
}

export function hourInZone(value: Date | string, timeZone?: string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .find((part) => part.type === "hour")?.value;
  return Number(hour);
}

export function dayKey(iso: string, timeZone?: string) {
  return localDayStamp(new Date(iso), timeZone);
}

export function isToday(iso: string, at = now(), timeZone?: string) {
  return localDayStamp(new Date(iso), timeZone) === localDayStamp(at, timeZone);
}

export function isTomorrow(iso: string, at = now(), timeZone?: string) {
  const tomorrow = new Date(at);
  tomorrow.setDate(at.getDate() + 1);
  return localDayStamp(new Date(iso), timeZone) === localDayStamp(tomorrow, timeZone);
}

export function isWeekend(iso: string) {
  const day = new Date(iso).getDay();
  return day === 0 || day === 6;
}

export function minutesUntil(iso: string, at = now()) {
  return Math.round((new Date(iso).getTime() - at.getTime()) / 60000);
}

export function byStartTime<T extends { startsAt: string }>(a: T, b: T) {
  return +new Date(a.startsAt) - +new Date(b.startsAt);
}

export function takeSoonest<T extends { startsAt: string }>(streams: T[], limit = 6, maxPerSlot = 2) {
  const ordered = [...streams].sort(byStartTime);
  const counts = new Map<number, number>();
  const picked: T[] = [];
  for (const stream of ordered) {
    const slot = +new Date(stream.startsAt);
    const used = counts.get(slot) ?? 0;
    if (used >= maxPerSlot) continue;
    counts.set(slot, used + 1);
    picked.push(stream);
    if (picked.length >= limit) return picked;
  }
  for (const stream of ordered) {
    if (picked.includes(stream)) continue;
    picked.push(stream);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function msUntil(iso: string, at = now()) {
  return new Date(iso).getTime() - at.getTime();
}

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatElapsed(ms: number) {
  return formatCountdown(Math.max(0, ms));
}

export function gbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: value >= 100 ? 0 : 0,
  }).format(value);
}

export function pct(value: number) {
  const signed = value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0);
  return `${signed}%`;
}
