import { ALL_STREAMS, SELLERS, sellerBySlug } from "./catalog";
import { now, withStatus } from "./time";
import type {
  Agent,
  AgentMatch,
  Category,
  CollectionItem,
  OpportunityBreakdown,
  Platform,
  Stream,
  StreamItem,
  UserState,
  WatchItem,
} from "./types";

export function streams(at = now()): Stream[] {
  return ALL_STREAMS.map((stream) => withStatus(stream, at)).filter((stream) => stream.status !== "ended");
}

export function allIndexed() {
  return ALL_STREAMS.map((stream) => withStatus(stream));
}

export function liveNow() {
  return streams()
    .filter((stream) => stream.status === "live")
    .sort((a, b) => (b.viewers ?? 0) - (a.viewers ?? 0));
}

export function startingSoon() {
  return streams()
    .filter((stream) => stream.status === "soon" || stream.status === "upcoming")
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export function tonight() {
  const at = now();
  return streams()
    .filter((stream) => {
      const d = new Date(stream.startsAt);
      return d.toDateString() === at.toDateString() && d.getHours() >= 17;
    })
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export function today() {
  const at = now();
  return streams()
    .filter((stream) => new Date(stream.startsAt).toDateString() === at.toDateString())
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export function tomorrow() {
  const at = now();
  const next = new Date(at);
  next.setDate(at.getDate() + 1);
  return streams()
    .filter((stream) => new Date(stream.startsAt).toDateString() === next.toDateString())
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export function next7() {
  return streams().sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export function byCategory(slug: Category) {
  return next7().filter((stream) => stream.category === slug);
}

export function byPlatform(platform: Platform) {
  return next7().filter((stream) => stream.platform === platform);
}

export function bySeller(slug: string) {
  return allIndexed()
    .filter((stream) => stream.sellerSlug === slug)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
}

export function getStream(id: string, extras: Stream[] = []) {
  return [...extras, ...ALL_STREAMS].map((stream) => withStatus(stream)).find((stream) => stream.id === id);
}

export function dealPct(item: StreamItem) {
  const price = item.currentPrice ?? item.startingPrice;
  return ((price - item.marketMedian) / item.marketMedian) * 100;
}

export function bestDeal(stream: Stream) {
  if (!stream.items.length) return null;
  return [...stream.items].sort((a, b) => dealPct(a) - dealPct(b))[0];
}

export function opportunity(stream: Stream, user?: UserState | null): OpportunityBreakdown {
  const seller = sellerBySlug(stream.sellerSlug);
  const deals = stream.items.filter((item) => dealPct(item) <= -8);
  const avgDeal =
    stream.items.reduce((sum, item) => sum + dealPct(item), 0) / Math.max(stream.items.length, 1);
  const matches = user ? matchingItems(stream, user) : [];
  const competition = seller ? seller.followers + stream.bookmarks * 8 : stream.bookmarks * 10;
  const lowComp = competition < 8000;

  let score = 48;
  const reasons: OpportunityBreakdown["reasons"] = [];

  if (avgDeal <= -10) {
    score += 18;
    reasons.push({
      label: "Price",
      detail: `Average starting prices are ${Math.abs(avgDeal).toFixed(0)}% below recent medians`,
      impact: "positive",
    });
  } else if (avgDeal <= -3) {
    score += 8;
    reasons.push({
      label: "Price",
      detail: "A few items sit below recent solds",
      impact: "positive",
    });
  } else {
    reasons.push({
      label: "Price",
      detail: "Most items sit around recent market",
      impact: "neutral",
    });
  }

  if (deals.length >= 3) {
    score += 10;
    reasons.push({
      label: "Supply of deals",
      detail: `${deals.length} listed items are 8%+ below recent medians`,
      impact: "positive",
    });
  }

  if (lowComp) {
    score += 12;
    reasons.push({
      label: "Competition",
      detail: seller
        ? `${seller.name} has ${seller.followers.toLocaleString()} followers and this show has ${stream.bookmarks} bookmarks — relatively quiet`
        : "Bookmark count is relatively low for this inventory",
      impact: "positive",
    });
  } else {
    score -= 6;
    reasons.push({
      label: "Competition",
      detail: "Popular seller / well-bookmarked show — expect more bidders",
      impact: "negative",
    });
  }

  if (seller && seller.rating >= 4.8) {
    score += 6;
    reasons.push({
      label: "Seller",
      detail: `Established seller · ${seller.rating} rating · ${seller.showsHosted} shows hosted`,
      impact: "positive",
    });
  }

  if (matches.length) {
    score += Math.min(16, matches.length * 4);
    reasons.push({
      label: "Watchlist relevance",
      detail: `${matches.length} item${matches.length === 1 ? "" : "s"} match your watchlist or interests`,
      impact: "positive",
    });
  } else {
    reasons.push({
      label: "Watchlist relevance",
      detail: "No exact watchlist match — still may be worth a look in this category",
      impact: "neutral",
    });
  }

  if (stream.itemCount >= 40) {
    score += 4;
    reasons.push({
      label: "Inventory",
      detail: `${stream.itemCount} listed items — more chances to find something`,
      impact: "positive",
    });
  }

  return { score: Math.max(12, Math.min(97, Math.round(score))), reasons };
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9£\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(value: string) {
  return normalise(value).split(" ").filter((token) => token.length > 2);
}

export function itemMatchesQuery(item: StreamItem, query: string, maxPrice?: number, grade?: string) {
  const hay = normalise(`${item.title} ${item.set ?? ""} ${item.grade ?? ""} ${item.category}`);
  const words = tokens(query);
  const hit = words.length === 0 || words.every((word) => hay.includes(word)) || words.filter((word) => hay.includes(word)).length >= Math.ceil(words.length * 0.6);
  if (!hit) return false;
  if (maxPrice && (item.currentPrice ?? item.startingPrice) > maxPrice) return false;
  if (grade && !normalise(item.grade ?? "").includes(normalise(grade))) return false;
  return true;
}

export function streamMatchesQuery(stream: Stream, query: string) {
  const hay = normalise(`${stream.title} ${stream.description} ${stream.tags.join(" ")} ${stream.category}`);
  const words = tokens(query);
  if (words.some((word) => hay.includes(word))) return true;
  return stream.items.some((item) => itemMatchesQuery(item, query));
}

export function matchingItems(stream: Stream, user: UserState): StreamItem[] {
  const queries = [
    ...user.watchlist.map((item) => item.query),
    ...user.agents.map((agent) => agent.query),
    ...user.collection.filter((item) => !item.owned).map((item) => item.title),
  ];
  const seen = new Set<string>();
  const hits: StreamItem[] = [];
  for (const item of stream.items) {
    const watchHit = user.watchlist.some((watch) => itemMatchesQuery(item, watch.query, watch.maxPrice, watch.grade));
    const agentHit = user.agents.some((agent) => itemMatchesQuery(item, agent.query, agent.maxPrice, agent.grade));
    const collectionHit = user.collection.some((piece) => !piece.owned && itemMatchesQuery(item, piece.title));
    const interestHit = user.interests.includes(item.category);
    if (watchHit || agentHit || collectionHit || (interestHit && queries.some((query) => itemMatchesQuery(item, query)))) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        hits.push(item);
      }
    }
  }
  if (!hits.length && user.interests.includes(stream.category)) {
    return stream.items.filter((item) => dealPct(item) <= -8).slice(0, 3);
  }
  return hits;
}

export function interestStreams(user: UserState) {
  return next7().filter((stream) => user.interests.includes(stream.category) || matchingItems(stream, user).length > 0);
}

export function bargainStreams(user?: UserState | null) {
  return next7()
    .map((stream) => ({ stream, opp: opportunity(stream, user) }))
    .filter((row) => row.opp.score >= 74)
    .sort((a, b) => b.opp.score - a.opp.score);
}

export function collectionMatches(user: UserState) {
  const missing = user.collection.filter((item) => !item.owned);
  if (!missing.length) return [];
  return next7()
    .map((stream) => ({
      stream,
      items: stream.items.filter((item) => missing.some((piece) => itemMatchesQuery(item, piece.title, undefined, piece.grade))),
    }))
    .filter((row) => row.items.length > 0);
}

export function agentMatches(user: UserState): AgentMatch[] {
  const results: AgentMatch[] = [];
  for (const agent of user.agents) {
    for (const stream of next7()) {
      if (agent.platforms.length && !agent.platforms.includes(stream.platform)) continue;
      if (agent.category && stream.category !== agent.category && !stream.items.some((item) => item.category === agent.category)) continue;
      const items = stream.items.filter((item) => itemMatchesQuery(item, agent.query, agent.maxPrice, agent.grade));
      if (!items.length && streamMatchesQuery(stream, agent.query)) {
        results.push({ agent, stream, items: [], dealPct: null });
        continue;
      }
      if (items.length) {
        const best = [...items].sort((a, b) => dealPct(a) - dealPct(b))[0];
        results.push({ agent, stream, items, dealPct: dealPct(best) });
      }
    }
  }
  return results.sort((a, b) => +new Date(a.stream.startsAt) - +new Date(b.stream.startsAt));
}

export function watchlistMatches(user: UserState) {
  return user.watchlist.flatMap((watch) =>
    next7()
      .map((stream) => ({
        watch,
        stream,
        items: stream.items.filter((item) => itemMatchesQuery(item, watch.query, watch.maxPrice, watch.grade)),
      }))
      .filter((row) => row.items.length > 0)
  );
}

export function tonightPicks(user: UserState) {
  const pool = [...today(), ...tonight()].filter((stream, index, list) => list.findIndex((row) => row.id === stream.id) === index);
  return pool
    .map((stream) => ({
      stream,
      items: matchingItems(stream, user),
      opp: opportunity(stream, user),
    }))
    .filter((row) => row.items.length > 0 || row.opp.score >= 78 || user.interests.includes(row.stream.category))
    .sort((a, b) => b.opp.score + b.items.length * 6 - (a.opp.score + a.items.length * 6))
    .slice(0, 8);
}

export function searchStreams(query: string, pool?: Stream[]) {
  const list = pool ?? next7();
  const q = query.trim();
  if (!q) return list;
  return list.filter((stream) => streamMatchesQuery(stream, q) || sellerBySlug(stream.sellerSlug)?.name.toLowerCase().includes(q.toLowerCase()));
}

export function comparables(item: StreamItem) {
  return ALL_STREAMS.flatMap((stream) =>
    stream.items
      .filter((other) => other.title === item.title && other.id !== item.id)
      .map((other) => ({ stream: withStatus(stream), item: other }))
  ).slice(0, 4);
}

export function categoryCounts() {
  const counts = new Map<string, number>();
  for (const stream of liveNow()) {
    counts.set(stream.category, (counts.get(stream.category) ?? 0) + 1);
  }
  return counts;
}

export function sellerStats(slug: string) {
  const seller = sellerBySlug(slug);
  const list = bySeller(slug);
  return { seller, streams: list, upcoming: list.filter((stream) => stream.status !== "ended") };
}

export { SELLERS };
