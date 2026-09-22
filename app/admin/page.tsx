"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { PageBack } from "@/components/PageBack";
import { isAdminEmail } from "@/lib/admin";
import { Boot, useStore } from "@/lib/store";

type Overview = {
  ok?: boolean;
  error?: string;
  generatedAt?: string;
  ready?: { events: boolean; members: boolean; billing: boolean; listings: boolean };
  setupSql?: string;
  stats?: {
    views24h: number;
    views7d: number;
    views30d: number;
    visitors24h: number;
    visitors7d: number;
    countries7d: number;
    members: number;
    paid: number;
    listings: number;
  };
  daily?: { date: string; views: number; visitors: number }[];
  pages?: { path: string; views: number; visitors: number }[];
  countries?: { country: string; views: number; visitors: number }[];
  referrers?: { label: string; count: number }[];
  devices?: { label: string; count: number }[];
  visits?: {
    at: string;
    path: string;
    ip: string;
    country: string;
    city: string;
    referrer: string;
    email: string;
    visitor: string;
    device: string;
  }[];
  members?: { name: string; email: string; interests: string; createdAt: string; paid: boolean }[];
  billing?: {
    email?: string;
    plan?: string;
    event?: string;
    cancel_at_period_end?: boolean;
    current_period_end?: string | null;
    created_at?: string;
  }[];
  listings?: {
    title?: string;
    seller?: string;
    platform?: string;
    url?: string;
    starts_at?: string;
    created_at?: string;
  }[];
};

function when(iso?: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminPage() {
  return (
    <Boot>
      <AdminInner />
    </Boot>
  );
}

function AdminInner() {
  const { user } = useStore();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdminEmail(user?.email)) return;
    let cancelled = false;
    fetch("/api/admin/overview")
      .then(async (response) => {
        const payload = (await response.json()) as Overview;
        if (cancelled) return;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || "Admin data is locked.");
        }
        setData(payload);
      })
      .catch((next) => {
        if (!cancelled) setError(next instanceof Error ? next.message : "Admin data is locked.");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  if (!isAdminEmail(user?.email)) {
    return (
      <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
        <PageBack href="/tonight" label="Back to tonight" />
        <h1 className="mt-6 font-display text-4xl">Nothing here.</h1>
        <p className="mt-3 text-paper-200/60">This page is only for the site owner.</p>
        <Link href="/" className="btn-ghost mt-6">
          Back to home
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Admin</p>
        <h1 className="mt-2 font-display text-4xl">Unlock admin</h1>
        <p className="mt-3 text-paper-200/70">{error}</p>
        <p className="mt-3 text-sm text-paper-200/50">
          Request a new sign-in link to {user?.email} and click it. That sets the server session admin needs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="btn-gold">
            Email a new sign-in link
          </Link>
          <Link href="/account" className="btn-ghost">
            Back to account
          </Link>
        </div>
      </div>
    );
  }

  if (!data?.stats) {
    return <p className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper-200/35">Loading site progress…</p>;
  }

  const peak = Math.max(1, ...((data.daily ?? []).map((item) => item.views)));

  return (
    <div className="space-y-10">
      <PageBack href="/account" label="Back to account" trail={[{ href: "/tonight", label: "Tonight" }]} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Admin</p>
          <h1 className="mt-2 font-display text-5xl">Site progress</h1>
          <p className="mt-2 text-paper-200/60">Visitors, members, and where traffic is coming from.</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/35">Updated {when(data.generatedAt)}</p>
      </header>

      {data.setupSql ? (
        <section className="rounded-3xl border border-gold/30 bg-gold/5 p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">One-time setup</p>
          <p className="mt-2 text-sm text-paper-200/70">
            Page visits are ready to record. Paste this into the Supabase SQL editor once so IP, country and referrer history can persist.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-ink-950 p-4 text-xs text-paper-200/80">{data.setupSql}</pre>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Views · 24h" value={data.stats.views24h} hint={`${data.stats.views7d} this week`} />
        <Stat label="Visitors · 24h" value={data.stats.visitors24h} hint={`${data.stats.visitors7d} this week`} />
        <Stat label="Countries · 7d" value={data.stats.countries7d} hint={`${data.stats.views30d} views / 30d`} />
        <Stat label="Members" value={data.stats.members} hint={`${data.stats.paid} paid · ${data.stats.listings} listings`} />
      </section>

      <section className="rounded-3xl border border-white/8 bg-ink-900 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/40">Last 14 days</p>
        <div className="mt-5 flex h-40 items-end gap-1.5">
          {(data.daily ?? []).map((item) => (
            <div key={item.date} className="flex h-full flex-1 flex-col justify-end" title={`${item.views} views · ${item.visitors} visitors`}>
              <div
                className="w-full rounded-t bg-gold/80"
                style={{ height: `${Math.max(4, (item.views / peak) * 100)}%` }}
              />
              <p className="mt-2 hidden text-center font-mono text-[9px] text-paper-200/35 sm:block">{dayLabel(item.date)}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Top pages">
          <Rows
            rows={(data.pages ?? []).map((item) => [item.path, `${item.views} views · ${item.visitors} people`])}
            empty="No page views yet."
          />
        </Panel>
        <Panel title="Countries">
          <Rows
            rows={(data.countries ?? []).map((item) => [item.country, `${item.views} views · ${item.visitors} people`])}
            empty="Country data appears after the first visit on Vercel."
          />
        </Panel>
        <Panel title="From where">
          <Rows
            rows={(data.referrers ?? []).map((item) => [item.label, `${item.count}`])}
            empty="No referrers yet. Direct visits still count."
          />
        </Panel>
        <Panel title="Devices">
          <Rows
            rows={(data.devices ?? []).map((item) => [item.label, `${item.count}`])}
            empty="No devices recorded yet."
          />
        </Panel>
      </div>

      <Panel title="Recent visits">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/40">
              <tr>
                <th className="pb-3 pr-3 font-medium">When</th>
                <th className="pb-3 pr-3 font-medium">Page</th>
                <th className="pb-3 pr-3 font-medium">Country</th>
                <th className="pb-3 pr-3 font-medium">IP</th>
                <th className="pb-3 pr-3 font-medium">From</th>
                <th className="pb-3 font-medium">Visitor</th>
              </tr>
            </thead>
            <tbody>
              {(data.visits ?? []).map((visit, index) => (
                <tr key={`${visit.at}-${visit.ip}-${index}`} className="border-t border-white/5">
                  <td className="py-2.5 pr-3 text-paper-200/70">{when(visit.at)}</td>
                  <td className="py-2.5 pr-3">{visit.path}</td>
                  <td className="py-2.5 pr-3">
                    {visit.country}
                    {visit.city ? <span className="block text-xs text-paper-200/40">{visit.city}</span> : null}
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-xs">{visit.ip || "—"}</td>
                  <td className="py-2.5 pr-3 text-paper-200/70">{visit.referrer}</td>
                  <td className="py-2.5 text-xs text-paper-200/55">
                    {visit.device}
                    {visit.email ? <span className="block">{visit.email}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data.visits ?? []).length === 0 ? <p className="text-sm text-paper-200/45">No visits stored yet.</p> : null}
        </div>
      </Panel>

      <Panel title="Members">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/40">
              <tr>
                <th className="pb-3 pr-3 font-medium">Name</th>
                <th className="pb-3 pr-3 font-medium">Email</th>
                <th className="pb-3 pr-3 font-medium">Interests</th>
                <th className="pb-3 font-medium">Plan</th>
              </tr>
            </thead>
            <tbody>
              {(data.members ?? []).map((member) => (
                <tr key={member.email} className="border-t border-white/5">
                  <td className="py-2.5 pr-3">{member.name || "—"}</td>
                  <td className="py-2.5 pr-3">{member.email}</td>
                  <td className="py-2.5 pr-3 text-paper-200/65">{member.interests || "—"}</td>
                  <td className="py-2.5">{member.paid ? "Paid" : "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data.members ?? []).length === 0 ? (
            <p className="text-sm text-paper-200/45">
              {data.ready?.members ? "No members stored yet." : "The signups table is not available yet."}
            </p>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Billing events">
          <Rows
            rows={(data.billing ?? []).map((row) => [
              `${row.email || "unknown"} · ${row.plan || "free"}`,
              `${row.event || "event"}${row.created_at ? ` · ${when(row.created_at)}` : ""}`,
            ])}
            empty={data.ready?.billing ? "No paid events yet." : "Billing history is not stored yet."}
          />
        </Panel>
        <Panel title="Stream listings">
          <Rows
            rows={(data.listings ?? []).map((row) => [
              `${row.title || "Untitled"} · ${row.seller || "seller"}`,
              row.platform || "—",
            ])}
            empty={data.ready?.listings ? "No seller listings yet." : "Listings table is not stored yet."}
          />
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-900 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/40">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
      <p className="mt-2 text-xs text-paper-200/45">{hint}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/8 bg-ink-900 p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/40">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Rows({ rows, empty }: { rows: [string, string][]; empty: string }) {
  if (!rows.length) return <p className="text-sm text-paper-200/45">{empty}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {rows.map(([left, right]) => (
        <li key={`${left}-${right}`} className="flex items-start justify-between gap-4 border-b border-white/5 pb-2">
          <span className="min-w-0 break-all">{left}</span>
          <span className="shrink-0 text-paper-200/50">{right}</span>
        </li>
      ))}
    </ul>
  );
}
