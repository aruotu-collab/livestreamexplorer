"use client";

import { useMemo, useState } from "react";
import { BrowseLinks, PageBack } from "@/components/PageBack";
import { StreamCard } from "@/components/StreamCard";
import { searchStreams } from "@/lib/intelligence";
import { useLiveFeed } from "@/lib/live-feed";
import { useStore } from "@/lib/store";

export default function SearchPage() {
  const { user } = useStore();
  const { week } = useLiveFeed();
  const [query, setQuery] = useState("Charizard PSA");
  const results = useMemo(() => searchStreams(query, week), [query, week]);

  return (
    <div className="space-y-8">
      <PageBack href="/tonight" label="Back to tonight" />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Cross-platform search</p>
        <h1 className="mt-2 font-display text-5xl">Tell me when this appears live.</h1>
        <p className="mt-3 max-w-2xl text-paper-200/65">
          Search titles, sellers and pre-loaded inventory across eBay Live and Whatnot. Save the query as a Watch Agent when you want it watched continuously.
        </p>
        <div className="mt-4">
          <BrowseLinks current="search" />
        </div>
      </header>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pikachu Van Gogh PSA 10" className="w-full py-3" />
      <p className="font-mono text-xs text-paper-200/45">{results.length} matching streams</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((stream) => (
          <StreamCard key={stream.id} stream={stream} user={user} />
        ))}
      </div>
    </div>
  );
}
