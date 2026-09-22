import { NextResponse } from "next/server";
import { isCategorySlug } from "@/lib/catalog";
import { createSessionToken, readMagicToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { recordSignup } from "@/lib/server/backend";
import type { Category } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token?.trim() ?? "";
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing sign-in link." }, { status: 400 });
  }

  try {
    const payload = readMagicToken(token);
    const interests = payload.interests.filter((item): item is Category => isCategorySlug(item));
    await recordSignup({
      name: payload.name,
      email: payload.email,
      interests: interests.length ? interests : ["pokemon"],
    });
    const response = NextResponse.json({
      ok: true,
      name: payload.name,
      email: payload.email,
      interests: interests.length ? interests : ["pokemon"],
    });
    response.cookies.set(SESSION_COOKIE, createSessionToken({ email: payload.email, name: payload.name }), sessionCookieOptions());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "This sign-in link is not valid.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
