"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LIVE_PLATFORMS } from "./platforms";
import type { Agent, Category, CollectionItem, Plan, UserState, WatchItem } from "./types";

const KEY = "lse-user-v1";

const STARTER_COLLECTION: CollectionItem[] = [
  { id: "c1", title: "Charizard ex 199/165", set: "151", grade: "PSA 10", category: "pokemon", estimatedValue: 184, owned: true },
  { id: "c2", title: "Pikachu Van Gogh", set: "Promo", grade: "PSA 10", category: "pokemon", estimatedValue: 242, owned: false },
  { id: "c3", title: "Umbreon VMAX Alt Art", set: "Evolving Skies", grade: "PSA 10", category: "pokemon", estimatedValue: 1147, owned: false },
  { id: "c4", title: "Gengar VMAX Alt Art", set: "Fusion Strike", grade: "PSA 10", category: "pokemon", estimatedValue: 168, owned: true },
  { id: "c5", title: "Lugia Neo Genesis", set: "Neo Genesis", grade: "PSA 9", category: "pokemon", estimatedValue: 545, owned: false },
  { id: "c6", title: "Charizard Base Set", set: "Base Set", grade: "PSA 9", category: "pokemon", estimatedValue: 420, owned: false },
  { id: "c7", title: "151 Booster Bundle", set: "151", grade: "Sealed", category: "pokemon", estimatedValue: 54, owned: true },
  { id: "c8", title: "Moonbreon Japanese", set: "Eevee Heroes", grade: "PSA 10", category: "pokemon", estimatedValue: 890, owned: false },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function demoUser(overrides: Partial<UserState> = {}): UserState {
  return {
    email: "collector@livestreamexplorer.com",
    name: "Alex",
    plan: "free",
    interests: ["pokemon", "football-cards", "watches"],
    agents: [
      {
        id: "agent-demo",
        name: "PSA 10 Pikachus under £150",
        query: "Pikachu PSA 10",
        platforms: LIVE_PLATFORMS.map((platform) => platform.slug),
        category: "pokemon",
        maxPrice: 150,
        grade: "PSA 10",
        notifyMinutes: 15,
        createdAt: new Date().toISOString(),
      },
    ],
    watchlist: [
      { id: "w1", query: "Pikachu Van Gogh PSA 10", category: "pokemon", createdAt: new Date().toISOString() },
      { id: "w2", query: "Charizard Base Set", category: "pokemon", createdAt: new Date().toISOString() },
      { id: "w3", query: "Beckham Merlin", category: "football-cards", createdAt: new Date().toISOString() },
    ],
    collection: STARTER_COLLECTION,
    favorites: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

type Store = {
  user: UserState | null;
  hydrated: boolean;
  signIn: (name: string, email: string, interests?: Category[]) => void;
  signOut: () => void;
  setPlan: (
    plan: Plan,
    extras?: { stripeCustomerId?: string; cancelAtPeriodEnd?: boolean; currentPeriodEnd?: string | null },
  ) => void;
  setInterests: (interests: Category[]) => void;
  addWatch: (item: Omit<WatchItem, "id" | "createdAt">) => void;
  removeWatch: (id: string) => void;
  addAgent: (item: Omit<Agent, "id" | "createdAt">) => { ok: true } | { ok: false; reason: string };
  removeAgent: (id: string) => void;
  toggleFavorite: (streamId: string) => void;
  addCollection: (item: Omit<CollectionItem, "id">) => void;
  toggleOwned: (id: string) => void;
  agentLimit: number;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !user) return;
    localStorage.setItem(KEY, JSON.stringify(user));
  }, [user, hydrated]);

  const agentLimit = user?.plan === "collector" ? 99 : user?.plan === "pro" ? 10 : 1;

  const value = useMemo<Store>(
    () => ({
      user,
      hydrated,
      agentLimit,
      signIn: (name, email, interests) =>
        setUser((current) => {
          if (current && current.email.toLowerCase() === email.toLowerCase()) {
            return {
              ...current,
              name,
              email,
              interests: interests?.length ? interests : current.interests,
            };
          }
          return demoUser({ name, email, ...(interests?.length ? { interests } : {}) });
        }),
      signOut: () => {
        localStorage.removeItem(KEY);
        setUser(null);
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {
          /* local sign-out still stands */
        });
      },
      setPlan: (plan, extras) =>
        setUser((current) =>
          current
            ? {
                ...current,
                plan,
                stripeCustomerId: extras?.stripeCustomerId ?? current.stripeCustomerId,
                cancelAtPeriodEnd: extras?.cancelAtPeriodEnd ?? (plan === "free" ? false : current.cancelAtPeriodEnd),
                currentPeriodEnd:
                  extras?.currentPeriodEnd === null
                    ? undefined
                    : extras?.currentPeriodEnd ?? (plan === "free" ? undefined : current.currentPeriodEnd),
              }
            : current
        ),
      setInterests: (interests) => setUser((current) => (current ? { ...current, interests } : current)),
      addWatch: (item) =>
        setUser((current) =>
          current
            ? { ...current, watchlist: [...current.watchlist, { ...item, id: uid("w"), createdAt: new Date().toISOString() }] }
            : current
        ),
      removeWatch: (id) =>
        setUser((current) => (current ? { ...current, watchlist: current.watchlist.filter((item) => item.id !== id) } : current)),
      addAgent: (item) => {
        if (!user) return { ok: false, reason: "Create an account first." };
        if (user.agents.length >= agentLimit) {
          return { ok: false, reason: `Your ${user.plan} plan includes ${agentLimit} Watch Agent${agentLimit === 1 ? "" : "s"}. Upgrade to add more.` };
        }
        setUser((current) =>
          current
            ? { ...current, agents: [...current.agents, { ...item, id: uid("a"), createdAt: new Date().toISOString() }] }
            : current
        );
        return { ok: true };
      },
      removeAgent: (id) =>
        setUser((current) => (current ? { ...current, agents: current.agents.filter((agent) => agent.id !== id) } : current)),
      toggleFavorite: (streamId) =>
        setUser((current) => {
          if (!current) return current;
          const has = current.favorites.includes(streamId);
          return {
            ...current,
            favorites: has ? current.favorites.filter((id) => id !== streamId) : [...current.favorites, streamId],
          };
        }),
      addCollection: (item) =>
        setUser((current) => (current ? { ...current, collection: [...current.collection, { ...item, id: uid("c") }] } : current)),
      toggleOwned: (id) =>
        setUser((current) =>
          current
            ? { ...current, collection: current.collection.map((item) => (item.id === id ? { ...item, owned: !item.owned } : item)) }
            : current
        ),
    }),
    [user, hydrated, agentLimit]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function Boot({ children }: { children: React.ReactNode }) {
  const { hydrated } = useStore();
  if (!hydrated) {
    return <p className="py-20 text-center font-mono text-xs uppercase tracking-[0.2em] text-paper-200/35">Loading your radar…</p>;
  }
  return <>{children}</>;
}
