import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export type MagicPayload = {
  email: string;
  name: string;
  interests: string[];
  exp: number;
  n: string;
};

function authSecret() {
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.RESEND_API_KEY;
  if (!secret) throw new Error("Auth is not configured");
  return secret;
}

export function createMagicToken(
  input: { email: string; name: string; interests: string[] },
  ttlMs = 30 * 60 * 1000,
) {
  const payload: MagicPayload = {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    interests: input.interests,
    exp: Date.now() + ttlMs,
    n: randomBytes(8).toString("hex"),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", authSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export type SessionPayload = {
  email: string;
  name: string;
  exp: number;
};

export const SESSION_COOKIE = "lse_session";
export const VISITOR_COOKIE = "lse_vid";

export function sessionCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function createSessionToken(input: { email: string; name: string }, ttlMs = 30 * 24 * 60 * 60 * 1000) {
  const payload: SessionPayload = {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    exp: Date.now() + ttlMs,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", authSecret()).update(`session:${body}`).digest("base64url");
  return `${body}.${sig}`;
}

export function readSessionToken(token: string): SessionPayload {
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("Sign in required.");
  const expected = createHmac("sha256", authSecret()).update(`session:${body}`).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new Error("Sign in required.");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  if (!payload.email?.includes("@") || !payload.exp || payload.exp < Date.now()) {
    throw new Error("Sign in required.");
  }
  return payload;
}

export function cookieValue(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  const parts = header.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  if (!match) return "";
  return decodeURIComponent(match.slice(name.length + 1));
}

export function readMagicToken(token: string): MagicPayload {
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("This sign-in link is not valid.");
  const expected = createHmac("sha256", authSecret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new Error("This sign-in link is not valid.");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as MagicPayload;
  if (!payload.email?.includes("@") || !payload.name || !payload.exp) {
    throw new Error("This sign-in link is not valid.");
  }
  if (payload.exp < Date.now()) {
    throw new Error("This sign-in link has expired. Request a new one.");
  }
  return payload;
}
