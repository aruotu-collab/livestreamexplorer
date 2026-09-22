import type { Metadata } from "next";
import { Suspense } from "react";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTracker } from "@/components/PageTracker";
import { LiveFeedProvider } from "@/lib/live-feed";
import { StoreProvider } from "@/lib/store";

const display = Newsreader({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://livestreamexplorer.com"),
  title: {
    default: "LiveStream Explorer — Buyer intelligence for live shopping",
    template: "%s · LiveStream Explorer",
  },
  description:
    "Discover every relevant eBay Live and Whatnot stream. Find the items you want, understand market value, and know when an opportunity appears.",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "lAtvFj53t7LmqnyMdTd4MUqo_ea1w1cLVhrcobsSLek",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={`${display.variable} ${sans.variable} ${mono.variable} font-sans`}>
        <GoogleAnalytics />
        <PageTracker />
        <StoreProvider>
          <LiveFeedProvider>
            <Suspense fallback={<header className="sticky top-0 z-40 h-[148px] border-b border-white/5 bg-ink-950/80" />}>
              <Header />
            </Suspense>
            <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">{children}</main>
            <Footer />
          </LiveFeedProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
