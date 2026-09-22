"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PageBack } from "@/components/PageBack";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, intent: "login" }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Could not send the sign-in email.");
      setSentTo(email);
    } catch (next) {
      setError(next instanceof Error ? next.message : "Could not send the sign-in email.");
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-white/8 bg-ink-900 p-8">
        <PageBack href="/tonight" label="Back to tonight" />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Check your email</p>
        <h1 className="font-display text-4xl">Confirm it&apos;s you</h1>
        <p className="text-paper-200/70">
          We sent a sign-in link to <span className="text-paper-50">{sentTo}</span>. Click it to get in. The link expires
          in 30 minutes.
        </p>
        <button onClick={() => setSentTo("")} className="btn-ghost">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageBack href="/tonight" label="Back to tonight" trail={[{ href: "/signup", label: "Create an account" }]} />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Sign in</p>
        <h1 className="mt-2 font-display text-5xl">No password. Just your inbox.</h1>
        <p className="mt-3 text-paper-200/65">We email a one-time link. You are signed in only after you click it.</p>
      </header>
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/8 bg-ink-900 p-6">
        <input name="email" type="email" placeholder="you@email.com" required />
        {error ? <p className="text-sm text-live">{error}</p> : null}
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Sending link…" : "Email me a sign-in link"}
        </button>
        <p className="text-xs text-paper-200/40">
          New here?{" "}
          <Link href="/signup" className="text-gold">
            Create an account
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
