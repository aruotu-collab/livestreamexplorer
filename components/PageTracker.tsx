"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTracker() {
  return (
    <Suspense fallback={null}>
      <PageTrackerInner />
    </Suspense>
  );
}

function PageTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/api")) return;
    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;
    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer,
        utmSource: searchParams.get("utm_source") ?? "",
        utmMedium: searchParams.get("utm_medium") ?? "",
        utmCampaign: searchParams.get("utm_campaign") ?? "",
      }),
      keepalive: true,
    }).catch(() => {
      /* tracking should never block the page */
    });
  }, [pathname, searchParams]);

  return null;
}
