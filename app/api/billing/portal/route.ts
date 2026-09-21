import { NextResponse } from "next/server";
import { findCustomerSubscription, getStripe, siteUrl } from "@/lib/server/stripe";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    customerId?: string;
    email?: string;
    intent?: "manage" | "cancel";
  } | null;

  try {
    const stripe = getStripe();
    const found = await findCustomerSubscription(body?.customerId, body?.email);
    const customerId = found.customerId;

    if (!customerId) {
      return NextResponse.json({ ok: false, error: "No Stripe customer on this account yet." }, { status: 404 });
    }

    const cancel = body?.intent === "cancel" && found.subscription?.id;
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl()}/account`,
      ...(cancel
        ? {
            flow_data: {
              type: "subscription_cancel",
              subscription_cancel: { subscription: found.subscription!.id },
            },
          }
        : {}),
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open billing portal.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
