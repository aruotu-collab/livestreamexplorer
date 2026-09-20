"use client";

import { FormEvent, useState } from "react";
import { LIVE_PLATFORMS } from "@/lib/platforms";

export default function ListStreamPage() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/list-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: String(data.get("platform") || ""),
          url: String(data.get("url") || ""),
          title: String(data.get("title") || ""),
          seller: String(data.get("seller") || ""),
          startsAt: String(data.get("when") || ""),
          items: String(data.get("items") || ""),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Could not submit the show.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the show.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Seller-submitted data</p>
        <h1 className="mt-2 font-display text-5xl">List your stream. Free.</h1>
        <p className="mt-3 text-paper-200/65">
          This is how we reduce dependence on scraping. You give us a show URL. Buyers who are already searching for those items find you.
        </p>
      </header>
      {done ? (
        <div className="rounded-3xl border border-teal/30 bg-ink-900 p-8">
          <p className="font-display text-3xl">Received. We will confirm title, category, time and products before it goes on the calendar.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 rounded-3xl border border-white/8 bg-ink-900 p-6">
          <select name="platform" defaultValue={LIVE_PLATFORMS[0]?.slug}>
            {LIVE_PLATFORMS.map((platform) => (
              <option key={platform.slug} value={platform.slug}>
                {platform.label}
              </option>
            ))}
          </select>
          <input name="url" placeholder="Show URL" required />
          <input name="title" placeholder="Title" required />
          <input name="seller" placeholder="Seller name" required />
          <input name="when" type="datetime-local" required />
          <textarea name="items" rows={4} placeholder="Optional inventory — one item per line" />
          {error ? <p className="text-sm text-live">{error}</p> : null}
          <button className="btn-gold w-full" disabled={busy}>
            {busy ? "Sending…" : "Submit show"}
          </button>
        </form>
      )}
    </div>
  );
}
