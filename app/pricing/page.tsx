"use client";

import { Boot, useStore } from "@/lib/store";
import type { Plan } from "@/lib/types";

const PLANS: {
  id: Plan;
  name: string;
  price: string;
  pitch: string;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: "£0",
    pitch: "The top of the funnel. Keep the calendar open.",
    features: [
      "Full 7-day livestream calendar",
      "Live Now / Tonight / Tomorrow",
      "Platform and category filters",
      "Seller and show pages",
      "Search streams",
      "1 Watch Agent",
      "Basic reminders",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "£7.99",
    pitch: "For buyers who want the market watched for them.",
    features: [
      "Everything in Free",
      "10 Watch Agents",
      "Smart item alerts",
      "Personalised Tonight",
      "Watchlist matching",
      "Opportunity alerts",
      "Cross-platform discovery",
    ],
  },
  {
    id: "collector",
    name: "Collector",
    price: "£14.99",
    pitch: "The collector operating system.",
    features: [
      "Everything in Pro",
      "Unlimited Agents",
      "Deal / opportunity scores",
      "Price intelligence & comparables",
      "Portfolio tracking",
      "Collection-gap matching",
      "Historical pricing snapshots",
    ],
  },
];

export default function PricingPage() {
  return (
    <Boot>
      <PricingInner />
    </Boot>
  );
}

function PricingInner() {
  const { user, setPlan } = useStore();

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Monetisation</p>
        <h1 className="mt-2 font-display text-5xl">Don&apos;t pay for a calendar. Pay for fewer wasted hours.</h1>
        <p className="mt-4 text-paper-200/65">
          Prices are a starting hypothesis — £4.99 to £14.99, annual plans, maybe £1 the first month. The experiment is which feature makes someone reach for their wallet.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const active = user?.plan === plan.id;
          return (
            <article
              key={plan.id}
              className={`rounded-3xl border p-6 ${plan.id === "pro" ? "border-gold/40 bg-ink-900 shadow-glow" : "border-white/8 bg-ink-900/70"}`}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/45">{plan.name}</p>
              <p className="mt-2 font-display text-5xl">
                {plan.price}
                <span className="text-lg text-paper-200/40">{plan.id === "free" ? "" : "/mo"}</span>
              </p>
              <p className="mt-3 text-sm text-paper-200/60">{plan.pitch}</p>
              <ul className="mt-6 space-y-2 text-sm text-paper-200/75">
                {plan.features.map((feature) => (
                  <li key={feature}>· {feature}</li>
                ))}
              </ul>
              <button
                onClick={() => setPlan(plan.id)}
                className={plan.id === "pro" ? "btn-gold mt-6 w-full" : "btn-ghost mt-6 w-full"}
              >
                {active ? "Current plan" : user ? `Switch to ${plan.name}` : "Sign in to choose"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
