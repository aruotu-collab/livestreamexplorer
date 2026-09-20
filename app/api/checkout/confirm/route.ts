import { NextResponse } from "next/server";
import { getStripe, isPaidPlan, planFromPriceId, summarizeSubscription } from "@/lib/server/stripe";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "Missing session." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.status !== "complete" && session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "Checkout is not complete." }, { status: 409 });
    }

    const subscription = typeof session.subscription === "object" ? session.subscription : null;
    const summary = summarizeSubscription(subscription);
    const planFromMeta = session.metadata?.plan;
    const plan = (planFromMeta && isPaidPlan(planFromMeta) ? planFromMeta : summary.plan !== "free" ? summary.plan : planFromPriceId(subscription?.items.data[0]?.price.id)) ?? null;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (!plan) {
      return NextResponse.json({ ok: false, error: "Could not match this payment to a plan." }, { status: 422 });
    }

    return NextResponse.json({
      ok: true,
      plan,
      customerId: customerId ?? null,
      email: session.customer_email ?? session.metadata?.email ?? null,
      cancelAtPeriodEnd: summary.cancelAtPeriodEnd,
      currentPeriodEnd: summary.currentPeriodEnd,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not confirm checkout.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
