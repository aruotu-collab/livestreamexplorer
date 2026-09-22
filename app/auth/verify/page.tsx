"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { Boot, useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

export default function VerifyPage() {
  return (
    <Boot>
      <Suspense fallback={<p className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper-200/35">Opening your link…</p>}>
        <VerifyInner />
      </Suspense>
    </Boot>
  );
}

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { signIn } = useStore();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("This sign-in link is missing.");
      return;
    }
    let cancelled = false;
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          ok?: boolean;
          name?: string;
          email?: string;
          interests?: Category[];
          error?: string;
        };
        if (cancelled) return;
        if (!response.ok || !data.ok || !data.email || !data.name) {
          throw new Error(data.error || "This sign-in link is not valid.");
        }
        signIn(data.name, data.email, data.interests);
        router.replace(isAdminEmail(data.email) ? "/admin" : "/agents");
      })
      .catch((next) => {
        if (!cancelled) setError(next instanceof Error ? next.message : "This sign-in link is not valid.");
      });
    return () => {
      cancelled = true;
    };
  }, [token, signIn, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-white/8 bg-ink-900 p-8">
        <h1 className="font-display text-4xl">Link didn&apos;t work</h1>
        <p className="text-paper-200/70">{error}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="btn-gold">
            Request a new link
          </Link>
          <Link href="/signup" className="btn-ghost">
            Create an account
          </Link>
          <Link href="/tonight" className="btn-ghost">
            Back to tonight
          </Link>
        </div>
      </div>
    );
  }

  return (
    <p className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper-200/35">
      Confirming your email…
    </p>
  );
}
