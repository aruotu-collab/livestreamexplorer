"use client";

import Link from "next/link";
import { Boot, useStore } from "@/lib/store";

export default function AccountPage() {
  return (
    <Boot>
      <AccountInner />
    </Boot>
  );
}

function AccountInner() {
  const { user, signOut } = useStore();

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/8 bg-ink-900 p-10">
        <h1 className="font-display text-4xl">No account on this device yet.</h1>
        <Link href="/signup" className="btn-gold mt-6">
          Create one
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold">Account</p>
        <h1 className="mt-2 font-display text-5xl">{user.name}</h1>
        <p className="mt-2 text-paper-200/60">
          {user.email} · {user.plan} plan · {user.interests.join(", ")}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <Card href="/agents" title={`${user.agents.length} agents`} label="Watch Agents" />
        <Card href="/collection" title={`${user.collection.length} pieces`} label="Collection" />
        <Card href="/tonight" title={`${user.watchlist.length} watch items`} label="Tonight feed" />
      </div>
      <div className="flex gap-3">
        <Link href="/pricing" className="btn-gold">
          Change plan
        </Link>
        <button onClick={signOut} className="btn-ghost">
          Sign out
        </button>
      </div>
    </div>
  );
}

function Card({ href, title, label }: { href: string; title: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/8 bg-ink-900 p-5 hover:border-gold/30">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-paper-200/40">{label}</p>
      <p className="mt-2 font-display text-3xl">{title}</p>
    </Link>
  );
}
