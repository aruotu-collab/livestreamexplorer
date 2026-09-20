import { NextResponse } from "next/server";
import { getStripe, isPaidPlan, priceIdFor, siteUrl } from "@/lib/server/stripe";

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
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      client_reference_id: email,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      line_items: [{ price: priceIdFor(plan), quantity: 1 }],
      metadata: { plan, email, name: body?.name?.trim() ?? "" },
      subscription_data: { metadata: { plan, email } },
      success_url: `${siteUrl()}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/pricing`,
    });

    if (!session.url) {
      return NextResponse.json({ ok: false, error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
