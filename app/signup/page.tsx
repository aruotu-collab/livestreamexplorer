"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

export default function SignupPage() {
  const { signIn, user } = useStore();
  const router = useRouter();
  const [picked, setPicked] = useState<Category[]>(user?.interests ?? ["pokemon"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, interests: picked }),
      });
      signIn(name || "Collector", email || "collector@local", picked);
      router.push("/agents");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Interest profile</p>
        <h1 className="mt-2 font-display text-5xl">Tell us what you hunt.</h1>
        <p className="mt-3 text-paper-200/65">
          Then we can say “21 streams tonight are relevant to you” instead of showing 400 shows.
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
          {busy ? "Saving…" : "Create account + 1 free agent"}
        </button>
        <p className="text-xs text-paper-200/40">We email your first Watch Agent confirmation. No password.</p>
      </form>
    </div>
  );
}
