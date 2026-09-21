import { NextResponse } from "next/server";
import { getStripe, isPaidPlan, priceIdFor, siteUrl, switchPaidPlan } from "@/lib/server/stripe";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    plan?: string;
    email?: string;
    name?: string;
  } | null;

  const plan = body?.plan;
  const email = body?.email?.trim().toLowerCase();
  if (!plan || !isPaidPlan(plan) || !email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "A paid plan and email are required." }, { status: 400 });
  }

  try {
    const existing = await switchPaidPlan(email, plan, body?.name);
    if (existing.kind !== "checkout") {
      return NextResponse.json({
        ok: true,
        changed: existing.kind === "switched",
        already: existing.kind === "unchanged",
        plan: existing.summary.plan,
        customerId: existing.customerId,
        cancelAtPeriodEnd: existing.summary.cancelAtPeriodEnd,
        currentPeriodEnd: existing.summary.currentPeriodEnd,
      });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ...(existing.customerId ? { customer: existing.customerId } : { customer_email: email }),
      client_reference_id: email,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      automatic_tax: { enabled: false },
      line_items: [{ price: priceIdFor(plan), quantity: 1 }],
      metadata: { plan, email, name: body?.name?.trim() ?? "" },
      subscription_data: { metadata: { plan, email } },
      success_url: `${siteUrl()}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/pricing`,
      // Managed Payments requires a product tax code; keep checkout usable in test.
      managed_payments: { enabled: false },
    } as Parameters<typeof stripe.checkout.sessions.create>[0]);

    if (!session.url) {
      return NextResponse.json({ ok: false, error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
