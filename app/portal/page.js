"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

export default function PortalPage() {
  const { data, error, isLoading } = useSWR("/api/v1/admin/packages", fetcher);
  const packages = data || [];
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="text-2xl font-bold mb-2">REAL POWERTECH LTD</div>
      <p className="text-muted-foreground mb-6 text-center">
        Please select a package to access the internet.
      </p>

      <div className="w-full max-w-md grid gap-3">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))
        ) : error ? (
          <div className="text-red-600 text-center">
            Failed to load packages.
          </div>
        ) : (
          packages
            .filter((p) => p.isActive)
            .map((p) => (
              <button
                key={p.id}
                className="text-left border rounded-md p-4 bg-card hover:scale-[1.02] transition transform"
                onClick={async () => {
                  setLoading(true);
                  // In Phase 2 we will call /api/v1/portal/checkout and redirect to ClickPesa
                  await new Promise((r) => setTimeout(r, 600));
                  window.location.href = "/success";
                }}
                disabled={loading}
              >
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-2xl font-bold">
                  {p.price.toLocaleString()} Tsh
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Tap to purchase
                </div>
              </button>
            ))
        )}
      </div>
    </div>
  );
}
