import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { readSessionToken, SESSION_COOKIE } from "@/lib/server/auth";
import { listBillingEvents, listSignups, listSiteEvents, listStreamListings, type SiteEventRow } from "@/lib/server/backend";
import { countryLabel, deviceFromUa } from "@/lib/server/geo";

const SETUP_SQL = `create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'pageview',
  path text,
  referrer text,
  referrer_host text,
  ip text,
  country text,
  region text,
  city text,
  user_agent text,
  visitor_id text,
  email text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);
create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
alter table public.site_events enable row level security;`;

function visitorKey(event: SiteEventRow) {
  return event.visitor_id || event.ip || "";
}

function countBy<T>(rows: T[], key: (row: T) => string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const value = key(row) || "Unknown";
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function uniqueCount(rows: SiteEventRow[]) {
  return new Set(rows.map(visitorKey).filter(Boolean)).size;
}

function since(rows: SiteEventRow[], ms: number) {
  const start = Date.now() - ms;
  return rows.filter((row) => {
    const stamp = row.created_at ? new Date(row.created_at).getTime() : 0;
    return stamp >= start;
  });
}

function sourceOf(event: SiteEventRow) {
  if (event.utm_source) return event.utm_source;
  const host = event.referrer_host ?? "";
  if (!host || host.endsWith("livestreamexplorer.com")) return "Direct / typed";
  return host;
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  try {
    const session = readSessionToken(token);
    if (!isAdminEmail(session.email)) {
      return NextResponse.json({ ok: false, error: "Admin only." }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Sign in with the admin email to unlock this page." }, { status: 401 });
  }

  const [events, members, billing, listings] = await Promise.all([
    listSiteEvents(1000),
    listSignups(300),
    listBillingEvents(150),
    listStreamListings(150),
  ]);

  const rows = events.rows;
  const day = since(rows, 24 * 60 * 60 * 1000);
  const week = since(rows, 7 * 24 * 60 * 60 * 1000);
  const month = since(rows, 30 * 24 * 60 * 60 * 1000);

  const dailyMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    dailyMap.set(date.toISOString().slice(0, 10), { views: 0, visitors: new Set() });
  }
  for (const event of rows) {
    const key = event.created_at ? event.created_at.slice(0, 10) : "";
    const bucket = dailyMap.get(key);
    if (!bucket) continue;
    bucket.views += 1;
    const visitor = visitorKey(event);
    if (visitor) bucket.visitors.add(visitor);
  }

  const pageMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const event of week) {
    const path = event.path || "/";
    const current = pageMap.get(path) ?? { views: 0, visitors: new Set<string>() };
    current.views += 1;
    const visitor = visitorKey(event);
    if (visitor) current.visitors.add(visitor);
    pageMap.set(path, current);
  }

  const countryMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const event of week) {
    const label = countryLabel(event.country);
    const current = countryMap.get(label) ?? { views: 0, visitors: new Set<string>() };
    current.views += 1;
    const visitor = visitorKey(event);
    if (visitor) current.visitors.add(visitor);
    countryMap.set(label, current);
  }

  const uniqueMembers = new Map<string, (typeof members.rows)[number]>();
  for (const member of members.rows) {
    const email = (member.email ?? "").toLowerCase();
    if (email && !uniqueMembers.has(email)) uniqueMembers.set(email, member);
  }

  const paid = new Set(
    billing.rows
      .filter((row) => row.plan === "pro" || row.plan === "collector")
      .map((row) => (row.email ?? "").toLowerCase())
      .filter(Boolean),
  );

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    ready: {
      events: events.ok,
      members: members.ok,
      billing: billing.ok,
      listings: listings.ok,
    },
    setupSql: events.ok ? "" : SETUP_SQL,
    stats: {
      views24h: day.length,
      views7d: week.length,
      views30d: month.length,
      visitors24h: uniqueCount(day),
      visitors7d: uniqueCount(week),
      countries7d: new Set(week.map((event) => event.country).filter(Boolean)).size,
      members: uniqueMembers.size,
      paid: paid.size,
      listings: listings.rows.length,
    },
    daily: [...dailyMap.entries()].map(([date, bucket]) => ({
      date,
      views: bucket.views,
      visitors: bucket.visitors.size,
    })),
    pages: [...pageMap.entries()]
      .map(([path, bucket]) => ({ path, views: bucket.views, visitors: bucket.visitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20),
    countries: [...countryMap.entries()]
      .map(([country, bucket]) => ({ country, views: bucket.views, visitors: bucket.visitors.size }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20),
    referrers: countBy(week, sourceOf).slice(0, 20),
    devices: countBy(week, (event) => deviceFromUa(event.user_agent)),
    visits: rows.slice(0, 150).map((event) => ({
      at: event.created_at ?? "",
      path: event.path ?? "/",
      ip: event.ip ?? "",
      country: countryLabel(event.country),
      city: event.city || event.region || "",
      referrer: sourceOf(event),
      email: event.email ?? "",
      visitor: event.visitor_id ?? "",
      device: deviceFromUa(event.user_agent),
    })),
    members: [...uniqueMembers.values()].map((member) => ({
      name: member.name ?? "",
      email: member.email ?? "",
      interests: Array.isArray(member.interests) ? member.interests.join(", ") : String(member.interests ?? ""),
      createdAt: member.created_at ?? "",
      paid: paid.has((member.email ?? "").toLowerCase()),
    })),
    billing: billing.rows.slice(0, 50),
    listings: listings.rows.slice(0, 50),
  });
}
