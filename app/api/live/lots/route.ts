import { getIndexedLots } from "@/lib/live-lots";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const lots = await getIndexedLots();
  return NextResponse.json({
    ok: true,
    fetchedAt: new Date(lots.at).toISOString(),
    streams: lots.streams,
  });
}
