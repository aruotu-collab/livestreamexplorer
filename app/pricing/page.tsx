"use client";

import { useState } from "react";
import { PageBack } from "@/components/PageBack";
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

function planLabel(plan: Plan) {
  if (plan === "pro") return "Pro";
  if (plan === "collector") return "Collector";
  return "Free";
}

function PricingInner() {
  const { user, setPlan } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function choose(plan: Plan) {
    setError("");
    setNotice("");
    if (plan === "free") return;
    if (!user) {
      window.location.href = "/signup";
      return;
    }
    if (user.plan === plan) return;
    setBusy(plan);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: user.email, name: user.name }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        url?: string;
        changed?: boolean;
        already?: boolean;
        plan?: Plan;
        customerId?: string | null;
        cancelAtPeriodEnd?: boolean;
        currentPeriodEnd?: string | null;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Could not change plan.");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (!data.plan) throw new Error(data.error || "Could not change plan.");
      setPlan(data.plan, {
        stripeCustomerId: data.customerId ?? undefined,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        currentPeriodEnd: data.currentPeriodEnd,
      });
      setNotice(
        data.already
          ? `You are already on ${planLabel(data.plan)}.`
          : `You are now on ${planLabel(data.plan)}. Stripe updated the same subscription and charged only the difference — you are not paying two plans.`,
      );
      setBusy(null);
    } catch (next) {
      setError(next instanceof Error ? next.message : "Could not change plan.");
      setBusy(null);
    }
  }

  async function openPortal(intent: "manage" | "cancel") {
    if (!user) {
      window.location.href = "/signup";
      return;
    }
    setBusy(intent);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.stripeCustomerId, email: user.email, intent }),
      });
      const data = (await response.json()) as { ok?: boolean; url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Could not open billing.");
      window.location.href = data.url;
    } catch (next) {
      setError(next instanceof Error ? next.message : "Could not open billing.");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-10">
      <PageBack href={user ? "/account" : "/tonight"} label={user ? "Back to account" : "Back to tonight"} />
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Monetisation</p>
        <h1 className="mt-2 font-display text-5xl">Don&apos;t pay for a calendar. Pay for fewer wasted hours.</h1>
        <p className="mt-4 text-paper-200/65">
          Pro is £7.99 a month. Collector is £14.99. Checkout is handled by Stripe — we never see your card. Switching
          between paid plans updates the same subscription, so nobody is billed twice.
        </p>
      </header>
      {notice ? <p className="text-sm text-gold">{notice}</p> : null}
      {error ? <p className="text-sm text-live">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const active = user?.plan === plan.id;
          const paidCurrent = Boolean(active && plan.id !== "free");
          const alreadyPaid = Boolean(user && user.plan !== "free");
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
              {paidCurrent ? (
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gold">Current plan</p>
                  {user?.cancelAtPeriodEnd && user.currentPeriodEnd ? (
                    <p className="text-xs text-paper-200/55">
                      Cancels {new Date(user.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  ) : (
                    <button onClick={() => openPortal("cancel")} disabled={busy !== null} className="btn-ghost w-full">
                      {busy === "cancel" ? "Opening…" : "Cancel subscription"}
                    </button>
                  )}
                  <button onClick={() => openPortal("manage")} disabled={busy !== null} className="btn-ghost w-full">
                    {busy === "manage" ? "Opening…" : "Manage billing"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => choose(plan.id)}
                  disabled={busy !== null || active || plan.id === "free"}
                  className={plan.id === "pro" ? "btn-gold mt-6 w-full" : "btn-ghost mt-6 w-full"}
                >
                  {busy === plan.id
                    ? alreadyPaid
                      ? "Switching…"
                      : "Redirecting…"
                    : active
                      ? "Current plan"
                      : !user
                        ? `Sign in for ${plan.name}`
                        : plan.id === "free"
                          ? "Included"
                          : alreadyPaid
                            ? `Switch to ${plan.name}`
                            : `Upgrade to ${plan.name}`}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
