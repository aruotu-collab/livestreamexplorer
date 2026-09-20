import { NextResponse } from "next/server";
import { recordStreamListing } from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    platform?: string;
    url?: string;
    title?: string;
    seller?: string;
    startsAt?: string;
    items?: string;
  } | null;

  const platform = body?.platform?.trim();
  const url = body?.url?.trim();
  const title = body?.title?.trim();
  const seller = body?.seller?.trim();

  if (!platform || !url || !title || !seller) {
    return NextResponse.json({ ok: false, error: "Platform, URL, title and seller are required." }, { status: 400 });
  }

  try {
    await recordStreamListing({
      platform,
      url,
      title,
      seller,
      startsAt: body?.startsAt?.trim() ?? "",
      items: body?.items?.trim() ?? "",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save listing.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
