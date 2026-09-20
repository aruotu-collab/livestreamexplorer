import { Resend } from "resend";

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
  if (!resendKey) {
    throw new Error("Resend is not configured");
  }

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

  await sendEmail(
    input.email,
    "Your LiveStream Explorer agent is ready",
    `<p>Hi ${input.name},</p>
     <p>Your free Watch Agent is on. We will watch eBay Live and Whatnot for the categories you picked: <strong>${input.interests.join(", ") || "your interests"}</strong>.</p>
     <p><a href="https://livestreamexplorer.com/tonight">See tonight</a></p>`,
  );
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
  await sendEmail(
    notify,
    `New stream listing: ${input.title}`,
    `<p>${input.seller} listed <strong>${input.title}</strong> on ${input.platform}.</p>
     <p>${input.url}</p>
     <p>Starts: ${input.startsAt || "unspecified"}</p>
     <pre>${input.items || "No inventory notes"}</pre>`,
  );
}
