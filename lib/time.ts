import type { Stream, StreamStatus } from "./types";

export const APP_NOW = new Date("2026-09-20T13:49:00+01:00");

export function now() {
  return APP_NOW;
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

export function formatWhen(iso: string, at = now()) {
  const date = new Date(iso);
  const sameDay = date.toDateString() === at.toDateString();
  const tomorrow = new Date(at);
  tomorrow.setDate(at.getDate() + 1);
  const time = date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${time}`;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + ` · ${time}`;
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function isToday(iso: string, at = now()) {
  return new Date(iso).toDateString() === at.toDateString();
}

export function isTomorrow(iso: string, at = now()) {
  const tomorrow = new Date(at);
  tomorrow.setDate(at.getDate() + 1);
  return new Date(iso).toDateString() === tomorrow.toDateString();
}

export function isWeekend(iso: string) {
  const day = new Date(iso).getDay();
  return day === 0 || day === 6;
}

export function minutesUntil(iso: string, at = now()) {
  return Math.round((new Date(iso).getTime() - at.getTime()) / 60000);
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
