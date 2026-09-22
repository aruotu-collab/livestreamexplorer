import { Resend } from "resend";
import { renderTransactionalEmail, siteUrl } from "@/lib/server/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM ?? "LiveStream Explorer <hello@livestreamexplorer.com>";

async function supabaseInsert(table: string, row: Record<string, unknown>) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Supabase insert failed (${response.status})`);
  }
}

export async function supabaseSelect<T>(table: string, query: string) {
  if (!supabaseUrl || !supabaseKey) return { rows: [] as T[], ok: false };

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
  if (!response.ok) return { rows: [] as T[], ok: false };
  const rows = (await response.json()) as T[];
  return { rows: Array.isArray(rows) ? rows : [], ok: true };
}

export type SiteEventRow = {
  id?: string;
  created_at?: string;
  kind?: string;
  path?: string | null;
  referrer?: string | null;
  referrer_host?: string | null;
  ip?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  user_agent?: string | null;
  visitor_id?: string | null;
  email?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
};

export type SignupRow = {
  name?: string;
  email?: string;
  interests?: string[] | string | null;
  created_at?: string;
};

export type BillingRow = {
  email?: string;
  plan?: string;
  stripe_customer_id?: string | null;
  event?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: string | null;
  created_at?: string;
};

export type ListingRow = {
  platform?: string;
  url?: string;
  title?: string;
  seller?: string;
  starts_at?: string;
  items?: string;
  created_at?: string;
};

export async function recordPageView(row: SiteEventRow) {
  try {
    await supabaseInsert("site_events", {
      kind: row.kind ?? "pageview",
      path: row.path ?? "/",
      referrer: row.referrer ?? "",
      referrer_host: row.referrer_host ?? "",
      ip: row.ip ?? "",
      country: row.country ?? "",
      region: row.region ?? "",
      city: row.city ?? "",
      user_agent: row.user_agent ?? "",
      visitor_id: row.visitor_id ?? "",
      email: row.email ?? "",
      utm_source: row.utm_source ?? "",
      utm_medium: row.utm_medium ?? "",
      utm_campaign: row.utm_campaign ?? "",
    });
    return true;
  } catch {
    return false;
  }
}

export async function listSiteEvents(limit = 800) {
  return supabaseSelect<SiteEventRow>(
    "site_events",
    `select=*&order=created_at.desc&limit=${Math.min(Math.max(limit, 1), 2000)}`,
  );
}

export async function listSignups(limit = 200) {
  const newest = await supabaseSelect<SignupRow>(
    "signups",
    `select=name,email,interests,created_at&order=created_at.desc&limit=${limit}`,
  );
  if (newest.ok) return newest;
  return supabaseSelect<SignupRow>("signups", `select=name,email,interests&limit=${limit}`);
}

export async function listBillingEvents(limit = 100) {
  const newest = await supabaseSelect<BillingRow>(
    "billing_events",
    `select=*&order=created_at.desc&limit=${limit}`,
  );
  if (newest.ok) return newest;
  return supabaseSelect<BillingRow>("billing_events", `select=*&limit=${limit}`);
}

export async function listStreamListings(limit = 100) {
  const newest = await supabaseSelect<ListingRow>(
    "stream_listings",
    `select=*&order=created_at.desc&limit=${limit}`,
  );
  if (newest.ok) return newest;
  return supabaseSelect<ListingRow>("stream_listings", `select=*&limit=${limit}`);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!resendKey) throw new Error("Email is not configured");

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
}

export async function findSignup(email: string) {
  if (!supabaseUrl || !supabaseKey) return null;

  const query = new URLSearchParams({
    email: `eq.${email.trim().toLowerCase()}`,
    select: "name,email,interests",
    limit: "1",
  });
  const response = await fetch(`${supabaseUrl}/rest/v1/signups?${query}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });
  if (!response.ok) return null;
  const rows = (await response.json()) as { name?: string; email?: string; interests?: string[] }[];
  return rows[0] ?? null;
}

export async function sendMagicLink(input: { name: string; email: string; interests: string[]; token: string }) {
  await sendEmail(
    input.email,
    "Sign in to LiveStream Explorer",
    renderTransactionalEmail({
      intro: "Use the secure link below to sign in to your LiveStream Explorer account.",
      heading: "Sign in to LiveStream Explorer",
      paragraphs: [
        "This link is unique to you and should only be used to access your account. For security, please don't forward or share this email.",
        "If you didn't request this sign-in link, you can safely ignore this email.",
      ],
      ctaLabel: "Sign in to LiveStream Explorer",
      ctaHref: `${siteUrl}/auth/verify?token=${encodeURIComponent(input.token)}`,
    }),
  );
}

export async function recordSignup(input: { name: string; email: string; interests: string[] }) {
  try {
    await supabaseInsert("signups", {
      name: input.name,
      email: input.email.toLowerCase(),
      interests: input.interests,
    });
  } catch {
    // Already signed up, or the table is not ready yet.
  }
}

export async function recordPlanChange(input: {
  email: string;
  plan: string;
  customerId?: string;
  event: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
}) {
  if (!supabaseUrl || !supabaseKey) return;

  try {
    await supabaseInsert("billing_events", {
      email: input.email.toLowerCase(),
      plan: input.plan,
      stripe_customer_id: input.customerId ?? null,
      event: input.event,
      cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
      current_period_end: input.currentPeriodEnd ?? null,
    });
  } catch {
    // The billing table is optional until the first paid subscriber.
  }
}

export async function recordStreamListing(input: {
  platform: string;
  url: string;
  title: string;
  seller: string;
  startsAt: string;
  items: string;
}) {
  await supabaseInsert("stream_listings", {
    platform: input.platform,
    url: input.url,
    title: input.title,
    seller: input.seller,
    starts_at: input.startsAt,
    items: input.items,
  });

  const notify = process.env.NOTIFY_EMAIL ?? "hello@livestreamexplorer.com";
  try {
    await sendEmail(
      notify,
      `New stream listing: ${input.title}`,
      renderTransactionalEmail({
        intro: "A seller submitted a stream listing. Use the link below to review it.",
        heading: "New stream listing",
        paragraphs: [
          `${input.seller} listed ${input.title} on ${input.platform}.`,
          `Starts: ${input.startsAt || "unspecified"}`,
          input.items?.trim() ? `Inventory notes: ${input.items.trim()}` : "No inventory notes were added.",
          "This listing is not live on the calendar until you confirm title, category, time and products.",
        ],
        ctaLabel: "Open the show",
        ctaHref: input.url || `${siteUrl}/tonight`,
      }),
    );
  } catch {
    // Persist the listing even if notification email is not configured yet.
  }
}
