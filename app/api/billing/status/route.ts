import { NextResponse } from "next/server";
import { findCustomerSubscription, summarizeSubscription } from "@/lib/server/stripe";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? "";
  const customerId = url.searchParams.get("customerId") ?? "";

  if (!email && !customerId) {
    return NextResponse.json({ ok: false, error: "Email or customer is required." }, { status: 400 });
  }

  try {
    const found = await findCustomerSubscription(customerId || undefined, email || undefined);
    const summary = summarizeSubscription(found.subscription);
    return NextResponse.json({
      ok: true,
      customerId: found.customerId,
      ...summary,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load subscription.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
