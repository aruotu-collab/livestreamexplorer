"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { PageBack } from "@/components/PageBack";
import { CATEGORIES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

export default function SignupPage() {
  const { user } = useStore();
  const [picked, setPicked] = useState<Category[]>(user?.interests ?? ["pokemon"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  function toggle(slug: Category) {
    setPicked((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, interests: picked, intent: "signup" }),
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
          We sent a sign-in link to <span className="text-paper-50">{sentTo}</span>. Click it to open your account. The
          link expires in 30 minutes.
        </p>
        <p className="text-sm text-paper-200/45">Didn&apos;t get it? Check spam, or request another link.</p>
        <button onClick={() => setSentTo("")} className="btn-ghost">
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageBack href="/tonight" label="Back to tonight" trail={[{ href: "/login", label: "Sign in" }]} />
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Interest profile</p>
        <h1 className="mt-2 font-display text-5xl">Tell us what you hunt.</h1>
        <p className="mt-3 text-paper-200/65">
          We&apos;ll email you a sign-in link. You are only signed in after you click it.
        </p>
      </header>
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-white/8 bg-ink-900 p-6">
        <input name="name" placeholder="Name" required />
        <input name="email" type="email" placeholder="you@email.com" required />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat.slug}
              onClick={() => toggle(cat.slug)}
              className={`chip ${picked.includes(cat.slug) ? "border-gold/50 text-gold" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-live">{error}</p> : null}
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Sending link…" : "Email me a sign-in link"}
        </button>
        <p className="text-xs text-paper-200/40">
          No password. Already have an account?{" "}
          <Link href="/login" className="text-gold">
            Sign in
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
