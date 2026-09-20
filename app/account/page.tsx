"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Boot, useStore } from "@/lib/store";
import type { Plan } from "@/lib/types";

function planLabel(plan: Plan | string) {
  if (plan === "pro") return "Pro";
  if (plan === "collector") return "Collector";
  return "Free";
}

function formatEnd(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

type BillingStatus = {
  ok?: boolean;
  plan?: Plan;
  status?: "none" | "active" | "canceling" | "past_due";
  customerId?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  error?: string;
};

export default function AccountPage() {
  return (
    <Boot>
      <Suspense fallback={<p className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper-200/35">Loading your radar…</p>}>
        <AccountInner />
      </Suspense>
    </Boot>
  );
}

function AccountInner() {
  const { user, signOut, setPlan } = useStore();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [notice, setNotice] = useState("");
  const [billingBusy, setBillingBusy] = useState(false);
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const lastStatus = useRef("");

  useEffect(() => {
    if (!sessionId || !user) return;
    let cancelled = false;
    fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data: BillingStatus & { customerId?: string }) => {
        if (cancelled) return;
        if (!data.ok || !data.plan) {
          setNotice(data.error || "Payment could not be confirmed yet. Refresh in a moment.");
          return;
        }
        setPlan(data.plan, {
          stripeCustomerId: data.customerId ?? undefined,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          currentPeriodEnd: data.currentPeriodEnd,
        });
        setNotice(`You are now on ${planLabel(data.plan)}.`);
        window.history.replaceState({}, "", "/account");
      })
      .catch(() => {
        if (!cancelled) setNotice("Payment could not be confirmed yet. Refresh in a moment.");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, user, setPlan]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (user.email) params.set("email", user.email);
    if (user.stripeCustomerId) params.set("customerId", user.stripeCustomerId);
    fetch(`/api/billing/status?${params}`)
      .then((response) => response.json())
      .then((data: BillingStatus) => {
        if (cancelled || !data.ok || !data.plan) return;
        const stamp = `${data.plan}|${data.customerId ?? ""}|${data.cancelAtPeriodEnd ? 1 : 0}|${data.currentPeriodEnd ?? ""}`;
        setStatus(data);
        if (lastStatus.current === stamp) return;
        lastStatus.current = stamp;
        setPlan(data.plan, {
          stripeCustomerId: data.customerId ?? undefined,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          currentPeriodEnd: data.currentPeriodEnd,
        });
      })
      .catch(() => {
        /* keep the locally stored plan if Stripe is unreachable */
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email, user?.stripeCustomerId, setPlan]);

  async function openBilling() {
    if (!user) return;
    setBillingBusy(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.stripeCustomerId, email: user.email }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!data.url) throw new Error(data.error || "Could not open billing.");
      window.location.href = data.url;
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not open billing.");
      setBillingBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
        <h1 className="font-display text-4xl">No account on this device yet.</h1>
        <Link href="/signup" className="btn-gold mt-6">
          Create one
        </Link>
      </div>
    );
  }

  const plan = status?.plan ?? user.plan;
  const canceling = Boolean((status?.cancelAtPeriodEnd ?? user.cancelAtPeriodEnd) && (status?.currentPeriodEnd ?? user.currentPeriodEnd));
  const periodEnd = status?.currentPeriodEnd ?? user.currentPeriodEnd;
  const billed = plan !== "free";

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Account</p>
        <h1 className="mt-2 font-display text-5xl">{user.name}</h1>
        <p className="mt-2 text-paper-200/60">
          {user.email} · {user.interests.join(", ")}
        </p>
        {notice ? <p className="mt-3 text-sm text-gold">{notice}</p> : null}
      </header>

      <section className={`rounded-3xl border p-6 ${canceling ? "border-gold/35 bg-gold/5" : "border-white/8 bg-ink-900"}`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-200/40">Subscription</p>
        <p className="mt-2 font-display text-4xl">{planLabel(plan)}</p>
        <p className="mt-3 text-sm text-paper-200/70">
          {!billed
            ? "No paid subscription. The calendar stays free."
            : canceling
              ? `You cancelled ${planLabel(plan)}. It stays active until ${formatEnd(periodEnd)}, then it ends.`
              : status?.status === "past_due"
                ? "Payment is past due. Update your card to keep this plan."
                : periodEnd
                  ? `${planLabel(plan)} renews on ${formatEnd(periodEnd)}.`
                  : `You are on ${planLabel(plan)}.`}
        </p>
        {canceling && periodEnd ? (
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-gold">Cancels {formatEnd(periodEnd)}</p>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card href="/agents" title={`${user.agents.length} agents`} label="Watch Agents" />
        <Card href="/collection" title={`${user.collection.length} pieces`} label="Collection" />
        <Card href="/tonight" title={`${user.watchlist.length} watch items`} label="Tonight feed" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/pricing" className="btn-gold">
          Change plan
        </Link>
        <button onClick={openBilling} disabled={billingBusy} className="btn-ghost">
          {billingBusy ? "Opening…" : billed ? "Manage billing" : "Billing"}
        </button>
        <button onClick={signOut} className="btn-ghost">
          Sign out
        </button>
      </div>
    </div>
  );
}

function Card({ href, title, label }: { href: string; title: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/8 bg-ink-900 p-5 hover:border-gold/30">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/40">{label}</p>
      <p className="mt-2 font-display text-3xl">{title}</p>
    </Link>
  );
}
