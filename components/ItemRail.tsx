import Link from "next/link";
import { ItemCard } from "./ItemCard";
import type { LiveLot } from "@/lib/types";

export function ItemRail({
  id,
  title,
  eyebrow,
  href,
  lots,
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  href?: string;
  lots: LiveLot[];
}) {
  if (!lots.length) return null;
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
        {lots.slice(0, 6).map((lot) => (
          <ItemCard key={`${lot.stream.id}-${lot.item.id}`} lot={lot} />
        ))}
      </div>
    </section>
  );
}
