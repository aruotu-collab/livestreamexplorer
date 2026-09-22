import { randomBytes } from "crypto";

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "";
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? headers.get("x-vercel-forwarded-for") ?? "";
}

export function requestGeo(headers: Headers) {
  const cityHeader = headers.get("x-vercel-ip-city") ?? "";
  let city = cityHeader;
  try {
    city = cityHeader ? decodeURIComponent(cityHeader) : "";
  } catch {
    city = cityHeader;
  }
  return {
    country: (headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? "").toUpperCase(),
    region: headers.get("x-vercel-ip-country-region") ?? "",
    city,
  };
}

export function referrerHost(referrer: string) {
  if (!referrer) return "";
  try {
    return new URL(referrer).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function cleanPath(path: string) {
  try {
    const url = new URL(path, "https://livestreamexplorer.com");
    url.searchParams.delete("token");
    url.searchParams.delete("session_id");
    const search = url.searchParams.toString();
    return (search ? `${url.pathname}?${search}` : url.pathname) || "/";
  } catch {
    return path.split("?")[0] || "/";
  }
}

export function newVisitorId() {
  return randomBytes(12).toString("hex");
}

export function countryLabel(code?: string | null) {
  const value = (code ?? "").trim().toUpperCase();
  if (!value) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(value) ?? value;
  } catch {
    return value;
  }
}

export function deviceFromUa(ua?: string | null) {
  const value = ua ?? "";
  if (/bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(value)) return "Bot";
  if (/iPad|Tablet/i.test(value)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(value)) return "Mobile";
  return "Desktop";
}
