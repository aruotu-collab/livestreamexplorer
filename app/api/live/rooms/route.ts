import { getIndexedLiveRooms } from "@/lib/live-index";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  const rooms = await getIndexedLiveRooms();
  return NextResponse.json({
    ok: true,
    source: rooms.source,
    fetchedAt: new Date(rooms.at).toISOString(),
    streams: rooms.streams,
    sellers: rooms.sellers,
  });
}
