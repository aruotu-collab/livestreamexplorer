import Link from "next/link";

type Crumb = { href: string; label: string };

export function PageBack({ href, label, trail }: { href: string; label: string; trail?: Crumb[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <Link href={href} className="inline-flex items-center gap-2 text-paper-200/70 hover:text-paper-50">
        <span aria-hidden className="text-gold">
          ←
        </span>
        {label}
      </Link>
      {trail?.length ? (
        <nav aria-label="Also nearby" className="flex flex-wrap items-center gap-2 text-paper-200/40">
          {trail.map((item, index) => (
            <span key={`${item.href}-${item.label}`} className="inline-flex items-center gap-2">
              {index > 0 ? <span aria-hidden>·</span> : null}
              <Link href={item.href} className="hover:text-paper-50">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

const BROWSE = [
  { href: "/guide", id: "guide", label: "Guide" },
  { href: "/tonight", id: "tonight", label: "Tonight" },
  { href: "/calendar", id: "calendar", label: "Calendar" },
  { href: "/items", id: "items", label: "Items" },
  { href: "/search", id: "search", label: "Search" },
] as const;

export function BrowseLinks({ current }: { current?: (typeof BROWSE)[number]["id"] }) {
  const items = BROWSE.filter((item) => item.id !== current);
  return (
    <nav aria-label="Browse" className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-paper-200/55">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="hover:text-paper-50">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
