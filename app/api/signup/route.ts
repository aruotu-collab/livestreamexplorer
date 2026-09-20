import { NextResponse } from "next/server";
import { recordSignup } from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    interests?: string[];
  } | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const interests = Array.isArray(body?.interests) ? body.interests.filter((item) => typeof item === "string") : [];

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }

  try {
    await recordSignup({ name, email, interests });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save signup.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
