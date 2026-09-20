import Stripe from "stripe";

export const PAID_PLANS = ["pro", "collector"] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export const PLAN_PRICES: Record<PaidPlan, { name: string; amount: number }> = {
  pro: { name: "Pro", amount: 799 },
  collector: { name: "Collector", amount: 1499 },
};

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://livestreamexplorer.com").replace(/\/$/, "");
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  return new Stripe(key);
}

export function isPaidPlan(value: string): value is PaidPlan {
  return PAID_PLANS.includes(value as PaidPlan);
}

export function priceIdFor(plan: PaidPlan) {
  const id = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_COLLECTOR;
  if (!id) throw new Error(`Missing Stripe price for ${plan}`);
  return id;
}

export function planFromPriceId(priceId?: string | null): PaidPlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_COLLECTOR) return "collector";
  return null;
}

export function periodEndFromSubscription(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0] as { current_period_end?: number } | undefined;
  const fromSub = (subscription as { current_period_end?: number }).current_period_end;
  const timestamp = item?.current_period_end ?? fromSub ?? subscription.cancel_at ?? null;
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

export function summarizeSubscription(subscription: Stripe.Subscription | null) {
  if (!subscription || subscription.status === "canceled" || subscription.status === "incomplete_expired") {
    return {
      plan: "free" as const,
      status: "none" as const,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: null as string | null,
    };
  }

  const priceId = subscription.items.data[0]?.price.id;
  const metaPlan = subscription.metadata?.plan ?? "";
  const plan = planFromPriceId(priceId) ?? (isPaidPlan(metaPlan) ? metaPlan : "free");
  const ending = Boolean(subscription.cancel_at_period_end || subscription.cancel_at);
  return {
    plan,
    status: ending ? ("canceling" as const) : subscription.status === "past_due" ? ("past_due" as const) : ("active" as const),
    cancelAtPeriodEnd: ending,
    currentPeriodEnd: periodEndFromSubscription(subscription),
  };
}

export async function findCustomerSubscription(customerId?: string, email?: string) {
  const stripe = getStripe();
  let id = customerId?.trim();
  if (!id && email) {
    const customers = await stripe.customers.list({ email: email.trim().toLowerCase(), limit: 1 });
    id = customers.data[0]?.id;
  }
  if (!id) return { customerId: null, subscription: null as Stripe.Subscription | null };

  const subscriptions = await stripe.subscriptions.list({
    customer: id,
    status: "all",
    limit: 10,
  });
  const subscription =
    subscriptions.data.find((item) => ["active", "trialing", "past_due", "unpaid"].includes(item.status)) ??
    subscriptions.data[0] ??
    null;

  return { customerId: id, subscription };
}
