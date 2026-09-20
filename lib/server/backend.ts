import { Resend } from "resend";
import { CATEGORIES } from "@/lib/catalog";
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

async function sendEmail(to: string, subject: string, html: string) {
  if (!resendKey) return;

  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
}

export async function recordSignup(input: { name: string; email: string; interests: string[] }) {
  await supabaseInsert("signups", {
    name: input.name,
    email: input.email.toLowerCase(),
    interests: input.interests,
  });

  try {
    const interests =
      input.interests
        .map((slug) => CATEGORIES.find((category) => category.slug === slug)?.label ?? slug)
        .filter(Boolean)
        .join(", ") || "the categories you picked";

    await sendEmail(
      input.email,
      "Your Watch Agent is ready",
      renderTransactionalEmail({
        intro: "Use the link below to open your LiveStream Explorer Watch Agent.",
        heading: "Your Watch Agent is ready",
        paragraphs: [
          `This Watch Agent is unique to you. It is watching eBay Live and Whatnot for ${interests}.`,
          "If you didn't create this account, you can safely ignore this email.",
        ],
        ctaLabel: "Open your Watch Agent",
        ctaHref: `${siteUrl}/agents`,
      }),
    );
  } catch {
    // Persist the signup even if transactional email is not configured yet.
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
