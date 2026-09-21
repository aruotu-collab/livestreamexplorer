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
      subscriptionId: null as string | null,
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
    subscriptionId: subscription.id,
  };
}

const LIVE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);

function planRank(subscription: Stripe.Subscription) {
  const plan = planFromPriceId(subscription.items.data[0]?.price.id);
  if (plan === "collector") return 2;
  if (plan === "pro") return 1;
  return 0;
}

export async function findCustomerSubscription(customerId?: string, email?: string) {
  const found = await findPaidSubscriptions(customerId, email);
  return { customerId: found.customerId, subscription: found.subscription };
}

export async function findPaidSubscriptions(customerId?: string, email?: string) {
  const stripe = getStripe();
  const customerIds = new Set<string>();
  if (customerId?.trim()) customerIds.add(customerId.trim());
  if (email?.trim()) {
    const customers = await stripe.customers.list({ email: email.trim().toLowerCase(), limit: 10 });
    for (const customer of customers.data) customerIds.add(customer.id);
  }

  const active: Stripe.Subscription[] = [];
  for (const id of customerIds) {
    const list = await stripe.subscriptions.list({ customer: id, status: "all", limit: 20 });
    for (const subscription of list.data) {
      if (LIVE_STATUSES.has(subscription.status)) active.push(subscription);
    }
  }

  active.sort((a, b) => planRank(b) - planRank(a) || b.created - a.created);
  const subscription = active[0] ?? null;
  const primaryCustomer =
    (typeof subscription?.customer === "string" ? subscription.customer : subscription?.customer?.id) ??
    customerId?.trim() ??
    [...customerIds][0] ??
    null;

  return { customerId: primaryCustomer, subscription, extras: active.slice(1) };
}

export async function cancelExtraSubscriptions(extras: Stripe.Subscription[]) {
  const stripe = getStripe();
  for (const extra of extras) {
    if (!LIVE_STATUSES.has(extra.status)) continue;
    await stripe.subscriptions.cancel(extra.id, { prorate: true });
  }
}

export async function switchPaidPlan(email: string, plan: PaidPlan, name?: string) {
  const stripe = getStripe();
  const found = await findPaidSubscriptions(undefined, email);
  if (found.extras.length) await cancelExtraSubscriptions(found.extras);

  if (!found.subscription) {
    return { kind: "checkout" as const, customerId: found.customerId, summary: summarizeSubscription(null) };
  }

  const current = summarizeSubscription(found.subscription);
  if (current.plan === plan) {
    return { kind: "unchanged" as const, customerId: found.customerId, summary: current };
  }

  const item = found.subscription.items.data[0];
  if (!item) throw new Error("This subscription has no price to change.");

  const upgrading = (plan === "collector" ? 2 : 1) > planRank(found.subscription);
  const updated = await stripe.subscriptions.update(found.subscription.id, {
    items: [{ id: item.id, price: priceIdFor(plan) }],
    proration_behavior: upgrading ? "always_invoice" : "create_prorations",
    ...(upgrading ? { payment_behavior: "error_if_incomplete" as const } : {}),
    cancel_at_period_end: false,
    metadata: { plan, email: email.toLowerCase(), name: name ?? "" },
  });

  return {
    kind: "switched" as const,
    customerId: found.customerId,
    summary: summarizeSubscription(updated),
  };
}
