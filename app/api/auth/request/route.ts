import { NextResponse } from "next/server";
import { isCategorySlug } from "@/lib/catalog";
import { createMagicToken } from "@/lib/server/auth";
import { findSignup, sendMagicLink } from "@/lib/server/backend";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    interests?: string[];
    intent?: "signup" | "login";
  } | null;

  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 400 });
  }

  const existing = await findSignup(email).catch(() => null);
  const interests = (
    Array.isArray(body?.interests)
      ? body.interests
      : existing?.interests ?? []
  ).filter((item): item is string => typeof item === "string" && isCategorySlug(item));
  const name =
    body?.name?.trim() ||
    existing?.name?.trim() ||
    email.split("@")[0] ||
    "Collector";

  if (body?.intent === "signup" && !body.name?.trim()) {
    return NextResponse.json({ ok: false, error: "Name and email are required." }, { status: 400 });
  }

  try {
    const token = createMagicToken({
      email,
      name,
      interests: interests.length ? interests : ["pokemon"],
    });
    await sendMagicLink({ email, name, interests: interests.length ? interests : ["pokemon"], token });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send the sign-in email.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
