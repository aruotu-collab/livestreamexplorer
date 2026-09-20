"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { collectionMatches } from "@/lib/intelligence";
import { Boot, useStore } from "@/lib/store";
import { formatWhen, gbp } from "@/lib/time";
import type { Category } from "@/lib/types";

export default function CollectionPage() {
  return (
    <Boot>
      <CollectionInner />
    </Boot>
  );
}

function CollectionInner() {
  const { user, addCollection, toggleOwned } = useStore();

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
        <h1 className="font-display text-5xl">Your collection becomes a shopping list the market can answer.</h1>
        <p className="mt-4 max-w-xl text-paper-200/65">
          Track what you own, what you still need, and which livestreams contain the gaps.
        </p>
        <Link href="/signup" className="btn-gold mt-6">
          Create free account
        </Link>
      </div>
    );
  }

  const owned = user.collection.filter((item) => item.owned);
  const missing = user.collection.filter((item) => !item.owned);
  const value = owned.reduce((sum, item) => sum + item.estimatedValue, 0);
  const hits = collectionMatches(user);
  const locked = user.plan !== "collector";

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addCollection({
      title: String(data.get("title")),
      set: String(data.get("set") || ""),
      grade: String(data.get("grade") || ""),
      category: (data.get("category") as Category) || "pokemon",
      estimatedValue: Number(data.get("value") || 0),
      owned: data.get("owned") === "on",
    });
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-10">
      <header className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Collector plan</p>
          <h1 className="mt-2 font-display text-5xl">My collection</h1>
          <p className="mt-3 text-paper-200/65">
            {owned.length} owned · {missing.length} missing · estimated {gbp(value)}
          </p>
        </div>
        <div className="rounded-2xl border border-teal/20 bg-ink-900 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal">Gap matching</p>
          <p className="font-display text-4xl">{hits.length}</p>
          <p className="text-sm text-paper-200/55">streams this week contain missing cards</p>
        </div>
      </header>

      {locked && (
        <p className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold">
          Collection tracking is a Collector feature. You can still add items in this prototype — upgrade to keep it as the retention engine.
          <Link href="/pricing" className="ml-2 underline">See Collector</Link>
        </p>
      )}

      <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-white/8 bg-ink-900 p-5 md:grid-cols-5">
        <input name="title" placeholder="Item — Charizard Base Set" required className="md:col-span-2" />
        <input name="set" placeholder="Set" />
        <input name="grade" placeholder="Grade" />
        <input name="value" type="number" placeholder="Est. £" />
        <label className="flex items-center gap-2 text-sm text-paper-200/60">
          <input name="owned" type="checkbox" className="accent-gold" /> Owned
        </label>
        <select name="category" defaultValue="pokemon">
          <option value="pokemon">Pokémon</option>
          <option value="football-cards">Football</option>
          <option value="watches">Watches</option>
        </select>
        <button className="btn-gold md:col-span-2">Add to collection</button>
      </form>

      <section className="grid gap-3">
        {user.collection.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleOwned(item.id)}
            className="flex items-center justify-between rounded-xl border border-white/8 bg-ink-900 px-4 py-3 text-left"
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-xs text-paper-200/45">
                {item.set} · {item.grade} · {item.owned ? "Owned" : "Still looking"}
              </span>
            </span>
            <span className={item.owned ? "text-teal" : "text-gold"}>{gbp(item.estimatedValue)}</span>
          </button>
        ))}
      </section>

      <section>
        <h2 className="font-display text-3xl">Missing pieces appearing live</h2>
        <div className="mt-5 space-y-3">
          {hits.map(({ stream, items }) => (
            <Link key={stream.id} href={`/stream/${stream.id}`} className="block rounded-2xl border border-white/8 bg-ink-900 p-5 hover:border-gold/30">
              <p className="font-display text-2xl">{stream.title}</p>
              <p className="text-sm text-paper-200/55">{formatWhen(stream.startsAt)} · {items.map((item) => item.title).join(" · ")}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
