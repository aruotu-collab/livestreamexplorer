import { eventUrlForPlatform } from "./platforms";
import type { Category, Platform, Seller, Stream, StreamItem } from "./types";

export const CATEGORIES: { slug: Category; label: string; blurb: string }[] = [
  { slug: "pokemon", label: "Pokémon", blurb: "Slabs, singles, sealed and £1 starts" },
  { slug: "football-cards", label: "Football cards", blurb: "Premier League, vintage and breaks" },
  { slug: "basketball-cards", label: "Basketball cards", blurb: "NBA slabs and modern hits" },
  { slug: "coins", label: "Coins", blurb: "Sovereigns, silver and world coinage" },
  { slug: "comics", label: "Comics", blurb: "Keys, graded books and back issues" },
  { slug: "memorabilia", label: "Memorabilia", blurb: "Signed shirts, programmes and relics" },
  { slug: "luxury", label: "Luxury", blurb: "Handbags, jewellery and designer" },
  { slug: "watches", label: "Watches", blurb: "Rolex, Omega and vintage pieces" },
  { slug: "sneakers", label: "Sneakers", blurb: "Jordan, Dunks and heat drops" },
  { slug: "vintage", label: "Vintage", blurb: "WOTC, 90s football and antiques" },
  { slug: "fashion", label: "Fashion", blurb: "Streetwear and apparel streams" },
  { slug: "electronics", label: "Electronics", blurb: "Consoles, phones and gadgets" },
];

export function isCategorySlug(slug: string): slug is Category {
  return CATEGORIES.some((cat) => cat.slug === slug);
}

export const SELLERS: Seller[] = [
  { slug: "cardboxuk", name: "CardBoxUK", platform: "whatnot", followers: 18400, bookmarks: 1260, rating: 4.9, showsHosted: 412, bio: "UK Pokémon slabs and vintage WOTC. Nightly singles with honest grading talk.", specialties: ["pokemon", "vintage"] },
  { slug: "x1-streams", name: "X1 Streams", platform: "whatnot", followers: 42100, bookmarks: 3100, rating: 4.8, showsHosted: 890, bio: "High-volume Pokémon and sports. Multiple shows a day across the week.", specialties: ["pokemon", "football-cards", "basketball-cards"] },
  { slug: "packofthenet", name: "PackOfTheNet", platform: "whatnot", followers: 9800, bookmarks: 640, rating: 4.7, showsHosted: 210, bio: "Football card breaks, Premier League and vintage inserts.", specialties: ["football-cards", "memorabilia"] },
  { slug: "cajun-breaker", name: "Cajun Breaker", platform: "whatnot", followers: 15200, bookmarks: 880, rating: 4.8, showsHosted: 305, bio: "NBA and football breaks with a loud room and late-night heat.", specialties: ["basketball-cards", "football-cards"] },
  { slug: "baileys-cardboard", name: "Bailey's Cardboard", platform: "whatnot", followers: 7300, bookmarks: 410, rating: 4.9, showsHosted: 178, bio: "Quiet UK room. Pokémon singles, vintage and collector-friendly starting prices.", specialties: ["pokemon", "vintage"] },
  { slug: "slab-city", name: "Slab City", platform: "whatnot", followers: 6100, bookmarks: 290, rating: 4.6, showsHosted: 140, bio: "PSA and CGC only. Lower follower count, strong inventory.", specialties: ["pokemon", "football-cards"] },
  { slug: "coin-room-uk", name: "Coin Room UK", platform: "whatnot", followers: 4200, bookmarks: 180, rating: 4.8, showsHosted: 96, bio: "Sovereigns, silver and world coins. Slow auctions, serious buyers.", specialties: ["coins"] },
  { slug: "key-issue", name: "Key Issue", platform: "whatnot", followers: 3900, bookmarks: 150, rating: 4.7, showsHosted: 84, bio: "Graded keys and raw back-issue runs.", specialties: ["comics"] },
  { slug: "pitchside-relics", name: "Pitchside Relics", platform: "whatnot", followers: 5400, bookmarks: 220, rating: 4.6, showsHosted: 112, bio: "Signed shirts, match-worn and programmes.", specialties: ["memorabilia", "football-cards"] },
  { slug: "dial-hunter", name: "Dial Hunter", platform: "whatnot", followers: 8700, bookmarks: 510, rating: 4.8, showsHosted: 156, bio: "Rolex, Omega and accessible vintage watches.", specialties: ["watches", "luxury"] },
  { slug: "sole-session", name: "Sole Session", platform: "whatnot", followers: 11200, bookmarks: 670, rating: 4.5, showsHosted: 201, bio: "Jordan, Dunk and heat. Fast auctions.", specialties: ["sneakers", "fashion"] },
  { slug: "wardrobe-live", name: "Wardrobe Live", platform: "whatnot", followers: 6800, bookmarks: 340, rating: 4.4, showsHosted: 133, bio: "Designer and vintage apparel.", specialties: ["fashion", "vintage", "luxury"] },
  { slug: "circuit-break", name: "Circuit Break", platform: "whatnot", followers: 5100, bookmarks: 190, rating: 4.5, showsHosted: 98, bio: "Consoles, handhelds and sealed electronics.", specialties: ["electronics"] },
  { slug: "grail-garage", name: "Grail Garage", platform: "whatnot", followers: 2400, bookmarks: 86, rating: 4.9, showsHosted: 47, bio: "Small room, high-grade Pokémon and watches. Often overlooked.", specialties: ["pokemon", "watches"] },
  { slug: "northern-slabs", name: "Northern Slabs", platform: "whatnot", followers: 3400, bookmarks: 120, rating: 4.7, showsHosted: 71, bio: "Manchester-based Pokémon and football slabs.", specialties: ["pokemon", "football-cards"] },
  { slug: "ebay-collectibles-live", name: "eBay Collectibles Live", platform: "ebay", followers: 28600, bookmarks: 1900, rating: 4.7, showsHosted: 220, bio: "Official-feeling collectibles events with scheduled UK slots.", specialties: ["pokemon", "football-cards", "coins"] },
  { slug: "ebay-luxury-live", name: "eBay Luxury Live", platform: "ebay", followers: 19400, bookmarks: 1420, rating: 4.6, showsHosted: 164, bio: "Watches, handbags and jewellery livestream events.", specialties: ["luxury", "watches"] },
  { slug: "ebay-sneakers-live", name: "eBay Sneakers Live", platform: "ebay", followers: 12100, bookmarks: 780, rating: 4.5, showsHosted: 98, bio: "Authenticated sneakers and streetwear events.", specialties: ["sneakers", "fashion"] },
  { slug: "ebay-electronics-live", name: "eBay Electronics Live", platform: "ebay", followers: 8800, bookmarks: 410, rating: 4.4, showsHosted: 76, bio: "Phones, consoles and refurbished tech events.", specialties: ["electronics"] },
  { slug: "ebay-vintage-finds", name: "eBay Vintage Finds", platform: "ebay", followers: 6400, bookmarks: 260, rating: 4.6, showsHosted: 58, bio: "Vintage clothing, coins and oddities.", specialties: ["vintage", "coins", "fashion"] },
];

const ITEM_POOL: Omit<StreamItem, "id" | "startingPrice" | "currentPrice">[] = [
  { title: "Charizard ex 199/165", set: "151", grade: "PSA 10", category: "pokemon", marketMedian: 184, marketLow: 160, marketHigh: 210, salesCount: 43, rarity: "rare" },
  { title: "Charizard Base Set", set: "Base Set", grade: "PSA 9", category: "pokemon", marketMedian: 420, marketLow: 370, marketHigh: 490, salesCount: 28, rarity: "grail" },
  { title: "Charizard Base Set", set: "Base Set", grade: "PSA 8", category: "pokemon", marketMedian: 275, marketLow: 240, marketHigh: 320, salesCount: 36, rarity: "rare" },
  { title: "Pikachu Van Gogh", set: "Promo", grade: "PSA 10", category: "pokemon", marketMedian: 242, marketLow: 210, marketHigh: 275, salesCount: 51, rarity: "rare" },
  { title: "Umbreon VMAX Alt Art", set: "Evolving Skies", grade: "PSA 10", category: "pokemon", marketMedian: 1147, marketLow: 1020, marketHigh: 1265, salesCount: 43, rarity: "grail" },
  { title: "Lugia Neo Genesis", set: "Neo Genesis", grade: "PSA 9", category: "pokemon", marketMedian: 545, marketLow: 510, marketHigh: 575, salesCount: 19, rarity: "grail" },
  { title: "Gengar VMAX Alt Art", set: "Fusion Strike", grade: "PSA 10", category: "pokemon", marketMedian: 168, marketLow: 145, marketHigh: 195, salesCount: 62, rarity: "uncommon" },
  { title: "Mewtwo GX Rainbow", set: "Shining Legends", grade: "PSA 10", category: "pokemon", marketMedian: 92, marketLow: 74, marketHigh: 118, salesCount: 40, rarity: "uncommon" },
  { title: "Pikachu Illustrator reprint", set: "Promo", grade: "Raw", category: "pokemon", marketMedian: 38, marketLow: 28, marketHigh: 52, salesCount: 14, rarity: "common" },
  { title: "Prismatic Evolutions ETB", set: "Prismatic Evolutions", grade: "Sealed", category: "pokemon", marketMedian: 86, marketLow: 72, marketHigh: 104, salesCount: 88, rarity: "uncommon" },
  { title: "151 Booster Bundle", set: "151", grade: "Sealed", category: "pokemon", marketMedian: 54, marketLow: 46, marketHigh: 66, salesCount: 110, rarity: "common" },
  { title: "Moonbreon Japanese", set: "Eevee Heroes", grade: "PSA 10", category: "pokemon", marketMedian: 890, marketLow: 810, marketHigh: 980, salesCount: 31, rarity: "grail" },
  { title: "Charizard VMAX Rainbow", set: "Champions Path", grade: "PSA 10", category: "pokemon", marketMedian: 310, marketLow: 270, marketHigh: 360, salesCount: 47, rarity: "rare" },
  { title: "Blastoise Base Set", set: "Base Set", grade: "PSA 8", category: "pokemon", marketMedian: 95, marketLow: 78, marketHigh: 120, salesCount: 22, rarity: "uncommon" },
  { title: "Venusaur Base Set", set: "Base Set", grade: "PSA 9", category: "pokemon", marketMedian: 140, marketLow: 118, marketHigh: 168, salesCount: 18, rarity: "uncommon" },
  { title: "Beckham Rookie Merlin", set: "Merlin 96/97", grade: "PSA 8", category: "football-cards", marketMedian: 220, marketLow: 180, marketHigh: 265, salesCount: 16, rarity: "rare" },
  { title: "Beckham Rookie Merlin", set: "Merlin 96/97", grade: "Raw", category: "football-cards", marketMedian: 48, marketLow: 32, marketHigh: 70, salesCount: 24, rarity: "uncommon" },
  { title: "Haaland Topps Chrome Gold", set: "Topps Chrome", grade: "PSA 10", category: "football-cards", marketMedian: 310, marketLow: 260, marketHigh: 380, salesCount: 21, rarity: "rare" },
  { title: "Salah Panini Prizm", set: "Prizm", grade: "PSA 10", category: "football-cards", marketMedian: 85, marketLow: 68, marketHigh: 110, salesCount: 33, rarity: "uncommon" },
  { title: "Manchester United 1999 squad", set: "Futera", grade: "Raw", category: "football-cards", marketMedian: 42, marketLow: 28, marketHigh: 60, salesCount: 12, rarity: "uncommon" },
  { title: "Premier League 2024/25 Hobby", set: "Topps", grade: "Sealed", category: "football-cards", marketMedian: 129, marketLow: 110, marketHigh: 155, salesCount: 47, rarity: "common" },
  { title: "Liverpool 90s insert lot", set: "Merlin", grade: "Raw", category: "football-cards", marketMedian: 36, marketLow: 22, marketHigh: 55, salesCount: 9, rarity: "common" },
  { title: "LeBron Chrome Rookie", set: "Topps Chrome", grade: "PSA 9", category: "basketball-cards", marketMedian: 890, marketLow: 780, marketHigh: 1050, salesCount: 14, rarity: "grail" },
  { title: "Wembanyama Prizm Silver", set: "Prizm", grade: "PSA 10", category: "basketball-cards", marketMedian: 165, marketLow: 140, marketHigh: 205, salesCount: 39, rarity: "rare" },
  { title: "Jordan Fleer 86 reprint", set: "Fleer", grade: "Raw", category: "basketball-cards", marketMedian: 28, marketLow: 18, marketHigh: 40, salesCount: 20, rarity: "common" },
  { title: "QVE Gold Sovereign", set: "1900s", grade: "EF", category: "coins", marketMedian: 545, marketLow: 520, marketHigh: 575, salesCount: 64, rarity: "uncommon" },
  { title: "Elizabeth II Sovereign", set: "1970s", grade: "UNC", category: "coins", marketMedian: 498, marketLow: 480, marketHigh: 520, salesCount: 81, rarity: "common" },
  { title: "American Silver Eagle", set: "2024", grade: "MS69", category: "coins", marketMedian: 42, marketLow: 36, marketHigh: 52, salesCount: 120, rarity: "common" },
  { title: "Victorian Crown", set: "1887", grade: "VF", category: "coins", marketMedian: 78, marketLow: 58, marketHigh: 110, salesCount: 17, rarity: "uncommon" },
  { title: "Amazing Spider-Man #300", set: "Marvel", grade: "CBCS 8.5", category: "comics", marketMedian: 185, marketLow: 150, marketHigh: 230, salesCount: 26, rarity: "rare" },
  { title: "X-Men #141", set: "Marvel", grade: "Raw", category: "comics", marketMedian: 45, marketLow: 30, marketHigh: 70, salesCount: 11, rarity: "uncommon" },
  { title: "Batman #423 McFarlane", set: "DC", grade: "CGC 9.6", category: "comics", marketMedian: 92, marketLow: 70, marketHigh: 125, salesCount: 15, rarity: "uncommon" },
  { title: "England 1966 signed programme", set: "FA", grade: "Authenticated", category: "memorabilia", marketMedian: 340, marketLow: 260, marketHigh: 420, salesCount: 6, rarity: "rare" },
  { title: "Man Utd 1999 signed shirt", set: "Umbro", grade: "Authenticated", category: "memorabilia", marketMedian: 480, marketLow: 390, marketHigh: 620, salesCount: 8, rarity: "rare" },
  { title: "Rolex Submariner 16610", set: "Rolex", grade: "Box & papers", category: "watches", marketMedian: 6850, marketLow: 6400, marketHigh: 7400, salesCount: 22, rarity: "grail" },
  { title: "Omega Speedmaster Reduced", set: "Omega", grade: "Watch only", category: "watches", marketMedian: 1980, marketLow: 1750, marketHigh: 2300, salesCount: 18, rarity: "rare" },
  { title: "Seiko SKX007", set: "Seiko", grade: "Watch only", category: "watches", marketMedian: 320, marketLow: 260, marketHigh: 390, salesCount: 34, rarity: "uncommon" },
  { title: "Cartier Tank Must", set: "Cartier", grade: "Box", category: "watches", marketMedian: 1650, marketLow: 1420, marketHigh: 1950, salesCount: 12, rarity: "rare" },
  { title: "Louis Vuitton Neverfull MM", set: "LV", grade: "Good", category: "luxury", marketMedian: 890, marketLow: 760, marketHigh: 1080, salesCount: 29, rarity: "uncommon" },
  { title: "Chanel Classic Flap", set: "Chanel", grade: "Very good", category: "luxury", marketMedian: 4200, marketLow: 3800, marketHigh: 4900, salesCount: 11, rarity: "grail" },
  { title: "Jordan 1 Chicago 2015", set: "Nike", grade: "9/10", category: "sneakers", marketMedian: 310, marketLow: 260, marketHigh: 380, salesCount: 44, rarity: "rare" },
  { title: "Dunk Low Panda", set: "Nike", grade: "DS", category: "sneakers", marketMedian: 95, marketLow: 80, marketHigh: 120, salesCount: 76, rarity: "common" },
  { title: "Yeezy 350 Beluga", set: "Adidas", grade: "8.5/10", category: "sneakers", marketMedian: 170, marketLow: 140, marketHigh: 210, salesCount: 38, rarity: "uncommon" },
  { title: "Stone Island badge jacket", set: "Stone Island", grade: "Good", category: "fashion", marketMedian: 220, marketLow: 160, marketHigh: 290, salesCount: 19, rarity: "uncommon" },
  { title: "Patagonia fleece 90s", set: "Patagonia", grade: "Vintage", category: "vintage", marketMedian: 85, marketLow: 55, marketHigh: 130, salesCount: 21, rarity: "common" },
  { title: "PlayStation 5 Slim", set: "Sony", grade: "Used", category: "electronics", marketMedian: 360, marketLow: 320, marketHigh: 410, salesCount: 90, rarity: "common" },
  { title: "Nintendo Switch OLED", set: "Nintendo", grade: "Used", category: "electronics", marketMedian: 210, marketLow: 180, marketHigh: 245, salesCount: 67, rarity: "common" },
  { title: "iPhone 15 Pro 256", set: "Apple", grade: "A-grade", category: "electronics", marketMedian: 620, marketLow: 560, marketHigh: 690, salesCount: 54, rarity: "uncommon" },
];

const SHOW_TEMPLATES: Record<Category, string[]> = {
  pokemon: [
    "Pokémon slabs — £1 starts",
    "Vintage WOTC & modern heat",
    "PSA 10 night",
    "151 & Prismatic singles",
    "Charizard hunt",
    "Quiet collector room",
    "Japanese & English mix",
    "Sealed & slabs",
  ],
  "football-cards": [
    "Premier League breaks",
    "Vintage football night",
    "Beckham & 90s inserts",
    "Topps Chrome hits",
    "Club-by-club singles",
    "Saturday football cardboard",
  ],
  "basketball-cards": [
    "NBA Prizm night",
    "Rookie slab auction",
    "Late-night hoops",
    "Modern NBA singles",
  ],
  coins: [
    "Sovereigns & silver",
    "World coin auction",
    "Bullion and hammered",
    "Sunday coin room",
  ],
  comics: [
    "Key issues live",
    "Graded books & raw runs",
    "Marvel keys",
  ],
  memorabilia: [
    "Signed shirts & relics",
    "Match-worn Friday",
    "Programmes and badges",
  ],
  luxury: [
    "Handbags & jewellery",
    "Designer authenticated",
    "Luxury closet clear-out",
  ],
  watches: [
    "Rolex & Omega night",
    "Vintage dials",
    "Accessible watch auction",
    "Tool watches live",
  ],
  sneakers: [
    "Jordan & Dunk heat",
    "Sneaker auction",
    "Deadstock Friday",
  ],
  vintage: [
    "Vintage finds",
    "90s wardrobe",
    "WOTC & antiques mix",
  ],
  fashion: [
    "Streetwear live",
    "Designer apparel",
    "Wardrobe drop",
  ],
  electronics: [
    "Consoles & handhelds",
    "Phones and gadgets",
    "Refurbished tech",
  ],
};

function hash(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, list: T[]) {
  return list[Math.floor(rng() * list.length)];
}

function eventUrl(platform: Platform, id: string) {
  return eventUrlForPlatform(platform, id);
}

function makeItems(rng: () => number, category: Category, count: number, streamId: string): StreamItem[] {
  const pool = ITEM_POOL.filter((item) => item.category === category);
  const source = pool.length ? pool : ITEM_POOL;
  const items: StreamItem[] = [];
  for (let i = 0; i < count; i++) {
    const base = source[Math.floor(rng() * source.length)];
    const discount = 0.72 + rng() * 0.4;
    const startingPrice = Math.max(1, Math.round(base.marketMedian * discount));
    const live = rng() > 0.55;
    items.push({
      ...base,
      id: `${streamId}-item-${i}`,
      startingPrice,
      currentPrice: live ? Math.round(startingPrice * (1 + rng() * 0.35)) : startingPrice,
    });
  }
  return items;
}

function buildVerifiedEbay(now: Date): Stream[] {
  const host = SELLERS.find((s) => s.slug === "ebay-collectibles-live")!;
  const luxury = SELLERS.find((s) => s.slug === "ebay-luxury-live")!;
  const specs: { day: number; hour: number; minute: number; title: string; seller: Seller; category: Category }[] = [
    { day: 20, hour: 15, minute: 0, title: "eBay Live — Collectibles Sunday", seller: host, category: "pokemon" },
    { day: 21, hour: 14, minute: 0, title: "eBay Live — Trading Cards Monday", seller: host, category: "football-cards" },
    { day: 22, hour: 7, minute: 0, title: "eBay Live — Early Coin & Collectibles", seller: host, category: "coins" },
    { day: 26, hour: 12, minute: 30, title: "eBay Live — Saturday Collectibles", seller: host, category: "pokemon" },
    { day: 26, hour: 16, minute: 30, title: "eBay Luxury Watches Live", seller: luxury, category: "watches" },
  ];

  return specs.map((spec, index) => {
    const starts = new Date(Date.UTC(2026, 8, spec.day, spec.hour - 1, spec.minute));
    const id = `ebay-verified-${index + 1}`;
    const rng = mulberry32(hash(id));
    const items = makeItems(rng, spec.category, 10 + Math.floor(rng() * 12), id);
    return {
      id,
      title: spec.title,
      description: "Indexed from eBay Live's public event schedule. Title, start time and seller taken from the channel listing.",
      platform: "ebay" as const,
      sellerSlug: spec.seller.slug,
      category: spec.category,
      tags: [spec.category, "ebay-live", "verified"],
      startsAt: starts.toISOString(),
      status: "upcoming" as const,
      thumbnailHue: 28 + index * 18,
      itemCount: items.length,
      bookmarks: 80 + Math.floor(rng() * 200),
      url: eventUrl("ebay", id),
      items,
    };
  });
}

export function generateStreams(now = new Date()): Stream[] {
  const streams: Stream[] = buildVerifiedEbay(now);
  const start = new Date(Date.UTC(2026, 8, 20, 8, 0));
  const end = new Date(Date.UTC(2026, 8, 27, 2, 0));

  for (const seller of SELLERS) {
    const shows = seller.platform === "whatnot" ? (seller.followers > 15000 ? 18 : seller.followers > 6000 ? 13 : 8) : 4;
    for (let n = 0; n < shows; n++) {
      const id = `stream-${seller.slug}-${n}`;
      const rng = mulberry32(hash(id + String(n)));
      const bucket = rng();
      let starts: Date;
      if (bucket < 0.12) {
        starts = new Date("2026-09-20T12:05:00+01:00");
        starts.setMinutes(starts.getMinutes() - Math.floor(rng() * 90), 0, 0);
      } else if (bucket < 0.26) {
        starts = new Date("2026-09-20T13:49:00+01:00");
        const soonOffsets = [6, 11, 16, 22, 29, 37, 46, 58, 71];
        starts.setMinutes(starts.getMinutes() + soonOffsets[Math.floor(rng() * soonOffsets.length)], 0, 0);
      } else if (bucket < 0.48) {
        starts = new Date("2026-09-20T17:00:00+01:00");
        starts.setHours(17 + Math.floor(rng() * 6), [0, 10, 15, 30, 45][Math.floor(rng() * 5)], 0, 0);
      } else {
        const span = end.getTime() - start.getTime();
        starts = new Date(start.getTime() + rng() * span);
        starts.setMinutes([0, 10, 15, 20, 30, 45][Math.floor(rng() * 6)], 0, 0);
      }
      const category = pick(rng, seller.specialties);
      const title = pick(rng, SHOW_TEMPLATES[category]);
      const itemCount = 8 + Math.floor(rng() * 28);
      const items = makeItems(rng, category, Math.min(itemCount, 14), id);
      const viewers = starts.getTime() < now.getTime() + 90 * 60000 && starts.getTime() > now.getTime() - 180 * 60000
        ? 40 + Math.floor(rng() * (seller.followers / 40))
        : undefined;

      streams.push({
        id,
        title: `${title}`,
        description: `${seller.name} ${category.replace("-", " ")} show. ${
          rng() > 0.5 ? "Pre-loaded inventory with starting prices." : "Auctions throughout — check the list before you sit down."
        }`,
        platform: seller.platform,
        sellerSlug: seller.slug,
        category,
        tags: [category, seller.platform, rng() > 0.7 ? "1-starts" : "singles"],
        startsAt: starts.toISOString(),
        status: "upcoming",
        thumbnailHue: Math.floor(rng() * 360),
        itemCount,
        viewers,
        bookmarks: Math.max(8, Math.round(seller.bookmarks * (0.02 + rng() * 0.12))),
        url: eventUrl(seller.platform, id.replace("stream-", "")),
        items,
        sponsored: rng() > 0.97,
      });
    }
  }

  return streams;
}

export function sellerBySlug(slug: string) {
  return SELLERS.find((seller) => seller.slug === slug);
}

export function categoryLabel(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const ALL_STREAMS = generateStreams(new Date("2026-09-20T13:00:00+01:00"));

const SURPRISE_HOOKS = [
  "Went live with no schedule",
  "Pop-up £1 starts",
  "Last-minute room",
  "Unlisted — just opened",
  "Impulse auction",
  "Quick session, no calendar slot",
];

export function createSurpriseStream(at: Date, seq: number): Stream {
  const seller = SELLERS[seq % SELLERS.length];
  const rng = mulberry32(hash(`surprise-${seller.slug}-${seq}-${Math.floor(at.getTime() / 8000)}`));
  const category = pick(rng, seller.specialties);
  const alreadyLive = rng() > 0.32;
  const starts = new Date(at);
  if (alreadyLive) starts.setMinutes(starts.getMinutes() - Math.floor(rng() * 22), starts.getSeconds());
  else starts.setMinutes(starts.getMinutes() + 2 + Math.floor(rng() * 16), [0, 15, 30, 45][Math.floor(rng() * 4)]);
  const id = `spotted-${seq}-${starts.getTime()}`;
  const items = makeItems(rng, category, 6 + Math.floor(rng() * 10), id);
  return {
    id,
    title: `${pick(rng, SURPRISE_HOOKS)} · ${pick(rng, SHOW_TEMPLATES[category])}`,
    description: `${seller.name} opened a room that was not on the published calendar. Sellers do this constantly — the scanner is watching for them.`,
    platform: seller.platform,
    sellerSlug: seller.slug,
    category,
    tags: [category, seller.platform, "unscheduled", "just-spotted"],
    startsAt: starts.toISOString(),
    status: alreadyLive ? "live" : "soon",
    thumbnailHue: Math.floor(rng() * 360),
    itemCount: 8 + Math.floor(rng() * 20),
    viewers: alreadyLive ? 18 + Math.floor(rng() * 160) : undefined,
    bookmarks: 4 + Math.floor(rng() * 40),
    url: eventUrl(seller.platform, id),
    items,
    unscheduled: true,
    discoveredAt: at.toISOString(),
  };
}
