import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { cookieValue, readSessionToken, SESSION_COOKIE, VISITOR_COOKIE, sessionCookieOptions } from "@/lib/server/auth";
import { recordPageView } from "@/lib/server/backend";
import { cleanPath, clientIp, newVisitorId, referrerHost, requestGeo } from "@/lib/server/geo";

const SKIP = [/^\/api\//, /^\/admin/, /^\/auth\//];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    path?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  } | null;

  const path = cleanPath(body?.path || "/");
  if (SKIP.some((rule) => rule.test(path))) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let email = "";
  try {
    const session = readSessionToken(cookieValue(request, SESSION_COOKIE));
    email = session.email;
    if (isAdminEmail(email)) {
      return NextResponse.json({ ok: true, skipped: true });
    }
  } catch {
    email = "";
  }

  const visitorId = cookieValue(request, VISITOR_COOKIE) || newVisitorId();
  const geo = requestGeo(request.headers);
  const referrer = typeof body?.referrer === "string" ? body.referrer.slice(0, 500) : "";
  const saved = await recordPageView({
    kind: "pageview",
    path: path.slice(0, 300),
    referrer,
    referrer_host: referrerHost(referrer),
    ip: clientIp(request.headers).slice(0, 80),
    country: geo.country,
    region: geo.region,
    city: geo.city.slice(0, 80),
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 300),
    visitor_id: visitorId,
    email,
    utm_source: (body?.utmSource ?? "").slice(0, 80),
    utm_medium: (body?.utmMedium ?? "").slice(0, 80),
    utm_campaign: (body?.utmCampaign ?? "").slice(0, 80),
  });

  const response = NextResponse.json({ ok: true, saved });
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    ...sessionCookieOptions(60 * 60 * 24 * 400),
    httpOnly: true,
  });
  return response;
}
