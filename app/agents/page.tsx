"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { agentMatches } from "@/lib/intelligence";
import { Boot, useStore } from "@/lib/store";
import { useLiveFeed } from "@/lib/live-feed";
import { formatWhen, gbp } from "@/lib/time";
import { LIVE_PLATFORMS, livePlatformSentence, platformLabel } from "@/lib/platforms";
import type { Category, Platform } from "@/lib/types";

export default function AgentsPage() {
  return (
    <Boot>
      <AgentsInner />
    </Boot>
  );
}

function AgentsInner() {
  const { user, addAgent, removeAgent, agentLimit } = useStore();
  const { clock, timeZone } = useLiveFeed();
  const [error, setError] = useState("");
  const matches = user ? agentMatches(user) : [];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = addAgent({
      name: String(data.get("name") || data.get("query")),
      query: String(data.get("query")),
      platforms: String(data.get("platform") || "all") === "all"
        ? LIVE_PLATFORMS.map((platform) => platform.slug)
        : ([String(data.get("platform"))] as Platform[]),
      category: (data.get("category") as Category) || undefined,
      maxPrice: data.get("maxPrice") ? Number(data.get("maxPrice")) : undefined,
      grade: String(data.get("grade") || "") || undefined,
      notifyMinutes: Number(data.get("notify") || 15),
    });
    if (!result.ok) setError(result.reason);
    else {
      setError("");
      event.currentTarget.reset();
    }
  }

  if (!user) {
    return (
      <Gate
        title="Watch Agents watch the market for you."
        body={`Write what you want once. We monitor upcoming inventories, titles and descriptions across ${livePlatformSentence()}.`}
      />
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Paid layer · starts free</p>
        <h1 className="mt-2 font-display text-5xl">My Watch Agents</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          Free includes 1 agent. Pro includes 10. Collector is unlimited. This is easier to sell than a premium calendar — because the agent finds the item.
        </p>
        <p className="mt-2 text-sm text-paper-200/45">
          {user.agents.length} / {user.plan === "collector" ? "unlimited" : agentLimit} active
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-3xl border border-white/8 bg-ink-900 p-6 md:grid-cols-2">
        <input name="name" placeholder="Agent name — e.g. Cheap PSA 10 Pikachus" required />
        <input name="query" placeholder="Find… PSA 10 Pikachu under £150" required />
        <select name="platform" defaultValue="all">
          <option value="all">All live platforms</option>
          {LIVE_PLATFORMS.map((platform) => (
            <option key={platform.slug} value={platform.slug}>
              {platform.label} only
            </option>
          ))}
        </select>
        <select name="category" defaultValue="">
          <option value="">Any category</option>
          <option value="pokemon">Pokémon</option>
          <option value="football-cards">Football cards</option>
          <option value="watches">Watches</option>
          <option value="coins">Coins</option>
        </select>
        <input name="maxPrice" type="number" placeholder="Max price £" />
        <input name="grade" placeholder="Grade — PSA 10" />
        <select name="notify" defaultValue="15">
          <option value="15">Notify 15 minutes before</option>
          <option value="60">Notify 60 minutes before</option>
        </select>
        <button className="btn-gold">Create agent</button>
        {error && (
          <p className="md:col-span-2 text-sm text-gold">
            {error} <Link href="/pricing" className="underline">See plans</Link>
          </p>
        )}
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {user.agents.map((agent) => (
          <article key={agent.id} className="rounded-2xl border border-white/8 bg-ink-900 p-5">
            <div className="flex justify-between gap-4">
              <h2 className="font-display text-2xl">{agent.name}</h2>
              <button onClick={() => removeAgent(agent.id)} className="text-xs text-paper-200/40">
                Remove
              </button>
            </div>
            <p className="mt-1 text-sm text-paper-200/55">
              {agent.query} {agent.maxPrice ? `· under ${gbp(agent.maxPrice)}` : ""}
            </p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="font-display text-3xl">Your agent found something</h2>
        <div className="mt-5 space-y-3">
          {matches.length === 0 && <p className="text-paper-200/50">No matches in the current 7-day window. Agents keep watching.</p>}
          {matches.slice(0, 12).map((match) => (
            <Link
              key={`${match.agent.id}-${match.stream.id}`}
              href={`/stream/${match.stream.id}`}
              className="block rounded-2xl border border-white/8 bg-ink-900 p-5 hover:border-gold/30"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-teal">{match.agent.name}</p>
              <p className="mt-1 font-display text-2xl">{match.items[0]?.title ?? match.stream.title}</p>
              <p className="text-sm text-paper-200/55">
                {platformLabel(match.stream.platform)} · {formatWhen(match.stream.startsAt, clock, timeZone)}
                {match.items[0] && ` · start ${gbp(match.items[0].startingPrice)} · median ${gbp(match.items[0].marketMedian)}`}
              </p>
              {match.dealPct !== null && match.dealPct < -8 && (
                <p className="mt-2 text-sm text-gold">Potential opportunity · {Math.abs(match.dealPct).toFixed(0)}% below recent median</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Gate({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
      <h1 className="font-display text-5xl">{title}</h1>
      <p className="mt-4 max-w-xl text-paper-200/65">{body}</p>
      <Link href="/signup" className="btn-gold mt-6">
        Create free account
      </Link>
    </div>
  );
}
