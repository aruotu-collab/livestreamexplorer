export function Logo({
  className = "",
  region,
  time,
}: {
  className?: string;
  region?: string;
  time?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-ink-800">
        <span className="absolute inset-1 rounded-full border border-gold/20" />
        <span className="h-1.5 w-1.5 rounded-full bg-live radar-ring" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] tracking-tight">LiveStream Explorer</span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-paper-200/60">Buyer intelligence</span>
      </span>
      {region || time ? (
        <span className="border-l border-white/10 pl-2.5 leading-none">
          {region ? (
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{region}</span>
          ) : null}
          {time ? <span className="mt-1 block font-mono text-sm tabular-nums text-paper-50">{time}</span> : null}
        </span>
      ) : null}
    </span>
  );
}
