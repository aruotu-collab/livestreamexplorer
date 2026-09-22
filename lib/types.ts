export type Platform = "ebay" | "whatnot" | "youtube" | "tiktok";
export type StreamStatus = "live" | "soon" | "upcoming" | "ended";
export type Plan = "free" | "pro" | "collector";

export type Category =
  | "pokemon"
  | "football-cards"
  | "basketball-cards"
  | "coins"
  | "comics"
  | "memorabilia"
  | "luxury"
  | "watches"
  | "sneakers"
  | "vintage"
  | "fashion"
  | "electronics";

export type ItemSource = "synthetic" | "ebay-seller";

export interface StreamItem {
  id: string;
  title: string;
  set?: string;
  grade?: string;
  category: Category;
  startingPrice: number;
  currentPrice?: number;
  marketMedian: number;
  marketLow: number;
  marketHigh: number;
  salesCount: number;
  rarity: "common" | "uncommon" | "rare" | "grail";
  listingUrl?: string;
  source?: ItemSource;
}

export interface Seller {
  slug: string;
  name: string;
  platform: Platform;
  handle?: string;
  followers: number;
  bookmarks: number;
  rating: number;
  showsHosted: number;
  bio: string;
  specialties: Category[];
}

export interface Stream {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  sellerSlug: string;
  sellerHandle?: string;
  category: Category;
  tags: string[];
  startsAt: string;
  status: StreamStatus;
  thumbnailHue: number;
  itemCount: number;
  viewers?: number;
  bookmarks: number;
  url: string;
  items: StreamItem[];
  sponsored?: boolean;
  unscheduled?: boolean;
  discoveredAt?: string;
}

export interface LiveLot {
  item: StreamItem;
  stream: Stream;
}

export interface WatchItem {
  id: string;
  query: string;
  category?: Category;
  maxPrice?: number;
  grade?: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  query: string;
  platforms: Platform[];
  category?: Category;
  maxPrice?: number;
  grade?: string;
  notifyMinutes: number;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  set?: string;
  grade?: string;
  category: Category;
  estimatedValue: number;
  owned: boolean;
}

export interface UserState {
  email: string;
  name: string;
  plan: Plan;
  stripeCustomerId?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
  interests: Category[];
  agents: Agent[];
  watchlist: WatchItem[];
  collection: CollectionItem[];
  favorites: string[];
  createdAt: string;
}

export interface OpportunityBreakdown {
  score: number;
  reasons: { label: string; detail: string; impact: "positive" | "neutral" | "negative" }[];
}

export interface AgentMatch {
  agent: Agent;
  stream: Stream;
  items: StreamItem[];
  dealPct: number | null;
}
