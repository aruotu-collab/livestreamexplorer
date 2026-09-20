import { categoryLabel } from "./catalog";
import { platformLabel } from "./platforms";
import { byStartTime, hourInZone } from "./time";
import type { Stream, StreamStatus } from "./types";

const STATUS_ORDER: Record<StreamStatus, number> = {
  live: 0,
  soon: 1,
  upcoming: 2,
  ended: 3,
};

export function byGuidePriority(a: Stream, b: Stream) {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || byStartTime(a, b);
}

export function visibleGuideSlot(slot: Stream[], expanded: boolean, limit: number) {
  if (expanded || slot.length <= limit) return slot;
  const soon = slot.filter((stream) => stream.status === "soon").slice(0, 2);
  const picked = new Set(soon.map((stream) => stream.id));
  for (const stream of slot) {
    if (picked.size >= limit) break;
    picked.add(stream.id);
  }
  return slot.filter((stream) => picked.has(stream.id));
}

export const GUIDE_DAYS = 14;

export const BANDS = [
  { id: "morning", label: "Morning", hint: "6am–12", startHour: 6, endHour: 12 },
  { id: "afternoon", label: "Afternoon", hint: "12–5pm", startHour: 12, endHour: 17 },
  { id: "evening", label: "Evening", hint: "5–9pm", startHour: 17, endHour: 21 },
  { id: "late", label: "Late", hint: "9pm–6am", startHour: 21, endHour: 6 },
] as const;

export type GuideBand = (typeof BANDS)[number]["id"];

export function localDayKey(value: Date | string, timeZone?: string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (timeZone) return date.toLocaleDateString("en-CA", { timeZone });
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfLocalDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function guideDates(from: Date, count = GUIDE_DAYS) {
  const start = startOfLocalDay(from);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function bandFor(iso: string, timeZone?: string): GuideBand {
  const hour = hourInZone(iso, timeZone);
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "late";
}

export function formatGuideDate(date: Date, timeZone?: string) {
  return {
    weekday: date.toLocaleDateString("en-GB", { weekday: "short", timeZone }),
    day: date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone }),
  };
}

export function categoryCounts(streams: Stream[]) {
  const counts = new Map<string, number>();
  for (const stream of streams) {
    const label = categoryLabel(stream.category);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export function platformCounts(streams: Stream[]) {
  const counts = new Map<string, number>();
  for (const stream of streams) {
    const label = platformLabel(stream.platform, "short");
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}
