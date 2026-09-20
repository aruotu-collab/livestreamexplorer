import { NextResponse } from "next/server";
import { getStripe, isPaidPlan, summarizeSubscription } from "@/lib/server/stripe";
import { recordPlanChange } from "@/lib/server/backend";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ ok: false, error: "Webhook is not configured." }, { status: 400 });
  }

  const stripe = getStripe();
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_email ?? session.metadata?.email ?? "";
      const planMeta = session.metadata?.plan;
      const plan = planMeta && isPaidPlan(planMeta) ? planMeta : null;
      if (email && plan) {
        await recordPlanChange({
          email,
          plan,
          customerId: typeof session.customer === "string" ? session.customer : undefined,
          event: event.type,
        });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const email = subscription.metadata?.email ?? "";
      const summary = summarizeSubscription(event.type === "customer.subscription.deleted" ? null : subscription);
      if (email) {
        await recordPlanChange({
          email,
          plan: summary.plan,
          customerId: typeof subscription.customer === "string" ? subscription.customer : undefined,
          event: event.type,
          cancelAtPeriodEnd: summary.cancelAtPeriodEnd,
          currentPeriodEnd: summary.currentPeriodEnd,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
