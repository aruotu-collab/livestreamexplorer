import { getIndexedLiveRooms, inferCategory } from "./live-index";
import type { Stream, StreamItem } from "./types";

const LOT_CACHE_MS = 3 * 60_000;
const MAX_SELLERS = 6;
const MAX_ITEMS = 8;

let lotCache: { at: number; streams: Stream[] } | null = null;
const sellerCache = new Map<string, { at: number; items: StreamItem[] }>();

function inferGrade(title: string) {
  const match = title.match(/\b(PSA|BGS|CGC|SGC|ACE|CBCS)\s*[\d.]+\b/i);
  if (match) return match[0].toUpperCase().replace(/\s+/, " ");
  if (/\bsealed|etb|booster box|bundle\b/i.test(title)) return "Sealed";
  if (/\braw\b/i.test(title)) return "Raw";
  return undefined;
}

function inferSet(title: string) {
  const match = title.match(/\b(Base Set|151|Prismatic Evolutions|Evolving Skies|Destined Rivals|Ascended Heroes|Pitch Black|Fusion Strike|Neo Genesis)\b/i);
  return match?.[1];
}

export function parseSellerMarkdown(markdown: string, category: Stream["category"]): StreamItem[] {
  const items = new Map<string, StreamItem>();
  const matches = markdown.matchAll(
    /\[([^\]\n]{8,160}?)(?:\s*Opens in a new window or tab)?\]\(https:\/\/www\.ebay\.co\.uk\/itm\/(\d{9,15})[^)]*\)[\s\S]{0,280}?£([\d,]+(?:\.\d{2})?)/g,
  );
  for (const match of matches) {
    const title = match[1].replace(/\s+/g, " ").replace(/^New listing\s*/i, "").trim();
    const id = match[2];
    const price = Number(match[3].replace(/,/g, ""));
    if (!id || id === "123456" || !price || items.has(id) || /^shop on ebay$/i.test(title)) continue;
    items.set(id, {
      id: `ebay-itm-${id}`,
      title,
      set: inferSet(title),
      grade: inferGrade(title),
      category: inferCategory(title, [category]),
      startingPrice: price,
      currentPrice: price,
      marketMedian: price,
      marketLow: price,
      marketHigh: price,
      salesCount: 0,
      rarity: "uncommon",
      listingUrl: `https://www.ebay.co.uk/itm/${id}`,
      source: "ebay-seller",
    });
    if (items.size >= MAX_ITEMS) break;
  }
  return [...items.values()];
}

async function fetchSellerLots(handle: string, category: Stream["category"]) {
  const cached = sellerCache.get(handle);
  if (cached && Date.now() - cached.at < LOT_CACHE_MS) return cached.items;
  try {
    const res = await fetch(`https://r.jina.ai/https://www.ebay.co.uk/sch/${encodeURIComponent(handle)}/m.html?_sop=10`, {
      headers: { accept: "text/plain" },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return cached?.items ?? [];
    const items = parseSellerMarkdown(await res.text(), category);
    sellerCache.set(handle, { at: Date.now(), items });
    return items;
  } catch {
    return cached?.items ?? [];
  }
}

export async function getIndexedLots() {
  if (lotCache && Date.now() - lotCache.at < LOT_CACHE_MS) return lotCache;
  const rooms = await getIndexedLiveRooms();
  const chosen: Stream[] = [];
  const seen = new Set<string>();
  const ranked = [...rooms.streams].sort((a, b) => {
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;
    return (b.viewers ?? 0) - (a.viewers ?? 0);
  });
  for (const stream of ranked) {
    const handle = stream.sellerHandle?.trim();
    if (!handle || seen.has(handle.toLowerCase())) continue;
    seen.add(handle.toLowerCase());
    chosen.push(stream);
    if (chosen.length >= MAX_SELLERS) break;
  }

  const fetched = await Promise.all(
    chosen.map(async (stream) => {
      const items = await fetchSellerLots(stream.sellerHandle!, stream.category);
      return { id: stream.id, items };
    }),
  );
  const byId = new Map(fetched.map((entry) => [entry.id, entry.items]));
  const streams = rooms.streams.map((stream) => {
    const items = byId.get(stream.id) ?? stream.items;
    return { ...stream, items, itemCount: items.length || stream.itemCount };
  });
  lotCache = { at: Date.now(), streams };
  return lotCache;
}
