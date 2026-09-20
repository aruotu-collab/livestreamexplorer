import { NextResponse } from "next/server";
import { getStripe, siteUrl } from "@/lib/server/stripe";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    customerId?: string;
    email?: string;
  } | null;

  try {
    const stripe = getStripe();
    let customerId = body?.customerId?.trim();

    if (!customerId && body?.email) {
      const customers = await stripe.customers.list({ email: body.email.trim().toLowerCase(), limit: 1 });
      customerId = customers.data[0]?.id;
    }

    if (!customerId) {
      return NextResponse.json({ ok: false, error: "No Stripe customer on this account yet." }, { status: 404 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl()}/account`,
    });

    return NextResponse.json({ ok: true, url: portal.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not open billing portal.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
