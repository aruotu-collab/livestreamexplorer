"use client";

import { useParams } from "next/navigation";
import { PageBack } from "@/components/PageBack";
import { StreamCard } from "@/components/StreamCard";
import { sellerStats } from "@/lib/intelligence";
import { outboundUrl, platformLabel } from "@/lib/platforms";
import { useStore } from "@/lib/store";

export default function SellerPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useStore();
  const { seller, upcoming } = sellerStats(slug);

  if (!seller) {
    return (
      <div className="space-y-6">
        <PageBack href="/guide" label="Back to the Guide" trail={[{ href: "/tonight", label: "Tonight" }, { href: "/search", label: "Search" }]} />
        <h1 className="font-display text-4xl">Seller not found.</h1>
        <p className="text-paper-200/65">That seller page is gone. Use the Guide or search to find a live room.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageBack
        href={`/live/${seller.platform}`}
        label={`Back to ${platformLabel(seller.platform)}`}
        trail={[
          { href: "/guide", label: "Guide" },
          { href: "/tonight", label: "Tonight" },
          { href: "/search", label: "Search" },
        ]}
      />
      <header className="rounded-3xl border border-white/8 bg-ink-900 p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">
          {platformLabel(seller.platform)} seller
        </p>
        <h1 className="mt-2 font-display text-5xl">{seller.name}</h1>
        <p className="mt-4 max-w-2xl text-paper-200/70">{seller.bio}</p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <Metric n={seller.followers.toLocaleString()} label="followers" />
          <Metric n={seller.bookmarks.toLocaleString()} label="typical bookmarks" />
          <Metric n={seller.rating.toFixed(1)} label="rating" />
          <Metric n={String(seller.showsHosted)} label="shows hosted" />
        </div>
        <a
          href={outboundUrl(seller.platform, { query: seller.name, category: seller.specialties[0], seed: seller.slug })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-live mt-6"
        >
          Open on {platformLabel(seller.platform, "short")}
        </a>
      </header>
      <section>
        <h2 className="font-display text-3xl">Upcoming shows</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((stream) => (
            <StreamCard key={stream.id} stream={stream} user={user} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl">{n}</p>
      <p className="text-paper-200/50">{label}</p>
    </div>
  );
}
