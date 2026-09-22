import { PageBack } from "@/components/PageBack";

export default function AboutPage() {
  return (
    <article className="prose-invert mx-auto max-w-3xl space-y-8">
      <PageBack href="/" label="Back to home" trail={[{ href: "/pricing", label: "Pricing" }, { href: "/list-your-stream", label: "List a stream" }]} />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">The company</p>
      <h1 className="font-display text-5xl leading-tight">Not a calendar website. A buyer-intelligence platform for livestream commerce.</h1>
      <p className="text-lg text-paper-200/70">
        eBay Live already has a schedule. Whatnot already has bookmarks and notifications. If we only aggregate calendars, the product is useful but not defensible. We sit above the marketplaces and answer the questions they are less incentivised to answer.
      </p>
      <section className="space-y-3 text-paper-200/75">
        <h2 className="font-display text-3xl text-paper-50">The sentence</h2>
        <p>Discover every relevant livestream, find the items you want, understand their market value, and know when an opportunity appears.</p>
      </section>
      <section className="space-y-3 text-paper-200/75">
        <h2 className="font-display text-3xl text-paper-50">Four layers</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Discovery — the free calendar.</li>
          <li>Personalisation — streams relevant to you.</li>
          <li>Intelligence — prices, opportunity, item matching.</li>
          <li>Automation — Watch Agents that monitor the market.</li>
        </ol>
      </section>
      <section className="space-y-3 text-paper-200/75">
        <h2 className="font-display text-3xl text-paper-50">Wedge, then expand</h2>
        <p>
          Start with collectibles: Pokémon, then sports cards, then coins, comics, memorabilia. Prices matter, products have names and grades, buyers purchase repeatedly, and livestream shopping is already established. Later: watches, sneakers, handbags, fashion, electronics.
        </p>
      </section>
      <section className="space-y-3 text-paper-200/75">
        <h2 className="font-display text-3xl text-paper-50">How we make money</h2>
        <p>Buyer subscriptions first. Affiliate/referral only where it does not distort recommendations. Seller tools later. Sponsored shows only if they are labelled Sponsored. Trust is the asset.</p>
      </section>
      <section className="space-y-3 text-paper-200/75">
        <h2 className="font-display text-3xl text-paper-50">What we will not do</h2>
        <p>We will not become another marketplace. No payments, no shipping, no disputes, no livestream infrastructure. The button says Open on Whatnot or Open on eBay.</p>
      </section>
      <section className="space-y-3 text-paper-200/75">
        <h2 className="font-display text-3xl text-paper-50">The metric that matters</h2>
        <p>Not monthly visitors. Qualified matches delivered — “an item you want is appearing tonight.”</p>
      </section>
    </article>
  );
}
