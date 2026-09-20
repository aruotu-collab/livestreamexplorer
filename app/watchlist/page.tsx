"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { watchlistMatches } from "@/lib/intelligence";
import { Boot, useStore } from "@/lib/store";
import { formatWhen, gbp } from "@/lib/time";

export default function WatchlistPage() {
  return (
    <Boot>
      <WatchlistInner />
    </Boot>
  );
}

function WatchlistInner() {
  const { user, addWatch, removeWatch } = useStore();

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
        <h1 className="font-display text-4xl">Follow things, not just sellers.</h1>
        <Link href="/signup" className="btn-gold mt-6">Create account</Link>
      </div>
    );
  }

  const matches = watchlistMatches(user);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addWatch({
      query: String(data.get("query")),
      maxPrice: data.get("maxPrice") ? Number(data.get("maxPrice")) : undefined,
      grade: String(data.get("grade") || "") || undefined,
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Smart watchlists</p>
        <h1 className="mt-2 font-display text-5xl">Follow the item.</h1>
      </header>
      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-white/8 bg-ink-900 p-5 md:grid-cols-4">
        <input name="query" placeholder="Pikachu Van Gogh PSA 10" required className="md:col-span-2" />
        <input name="maxPrice" type="number" placeholder="Max £" />
        <button className="btn-gold">Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {user.watchlist.map((item) => (
          <button key={item.id} onClick={() => removeWatch(item.id)} className="chip">
            {item.query} ×
          </button>
        ))}
      </div>
      <section className="space-y-3">
        {matches.map(({ watch, stream, items }) => (
          <Link key={`${watch.id}-${stream.id}`} href={`/stream/${stream.id}`} className="block rounded-2xl border border-white/8 bg-ink-900 p-5">
            <p className="text-xs text-teal">{watch.query}</p>
            <p className="font-display text-2xl">{stream.title}</p>
            <p className="text-sm text-paper-200/55">
              {formatWhen(stream.startsAt)} · {items[0] && `${items[0].title} ${gbp(items[0].startingPrice)}`}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
