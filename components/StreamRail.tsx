import Link from "next/link";
import { StreamCard } from "./StreamCard";
import type { Stream, UserState } from "@/lib/types";

export function StreamRail({
  id,
  title,
  eyebrow,
  href,
  streams,
  user,
  matches,
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  href?: string;
  streams: Stream[];
  user?: UserState | null;
  matches?: Record<string, number>;
}) {
  if (!streams.length) return null;
  return (
    <section id={id} className="scroll-mt-48 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">{eyebrow}</p>}
          <h2 className="font-display text-3xl">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="text-sm text-paper-200/60 hover:text-paper-50">
            View all
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {streams.slice(0, 6).map((stream) => (
          <StreamCard key={stream.id} stream={stream} user={user} matchCount={matches?.[stream.id]} />
        ))}
      </div>
    </section>
  );
}
