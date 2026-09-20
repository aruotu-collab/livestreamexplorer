import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl">Marketplaces give sellers intelligence. We give it to buyers.</p>
          <p className="mt-3 max-w-md text-sm text-paper-200/60">
            LiveStream Explorer is an independent discovery and intelligence layer for livestream shopping. We do not process payments or host streams. We send you to eBay Live and Whatnot.
          </p>
        </div>
        <div className="space-y-2 text-sm text-paper-200/70">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">Explore</p>
          <Link className="block hover:text-paper-50" href="/live/pokemon">Pokémon tonight</Link>
          <Link className="block hover:text-paper-50" href="/live/football-cards">Football cards</Link>
          <Link className="block hover:text-paper-50" href="/live/whatnot">Whatnot</Link>
          <Link className="block hover:text-paper-50" href="/live/ebay">eBay Live</Link>
        </div>
        <div className="space-y-2 text-sm text-paper-200/70">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-200/40">Product</p>
          <Link className="block hover:text-paper-50" href="/pricing">Pricing</Link>
          <Link className="block hover:text-paper-50" href="/list-your-stream">List your stream</Link>
          <Link className="block hover:text-paper-50" href="/about">The strategy</Link>
          <Link className="block hover:text-paper-50" href="/account">Account</Link>
        </div>
      </div>
      <p className="border-t border-white/5 py-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/35">
        Prototype calendar · Indexed eBay + Whatnot sample · Buyer first
      </p>
    </footer>
  );
}
