"use client";

import { useMemo, useState } from "react";
import { mockServicePackages } from "@/lib/mockApi";

export default function CaptivePortalPage() {
  const [loading, setLoading] = useState(false);
  const packages = useMemo(() => mockServicePackages, []);

  const onSelect = (pkg) => {
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/portal/success?duration=" + pkg.durationMinutes;
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-8">
      <div className="text-2xl font-bold mb-6">REAL POWERTECH LTD</div>
      <h1 className="text-3xl font-semibold mb-1">Get Connected</h1>
      <p className="text-muted-foreground mb-6">
        Please select a package to access the internet.
      </p>

      <div className="w-full max-w-md space-y-4">
        {packages.map((p) => (
          <button
            key={p.id}
            className="w-full text-left p-5 rounded-lg shadow border bg-white hover:scale-[1.01] transition-transform"
            onClick={() => onSelect(p)}
            disabled={loading}
          >
            <div className="text-xl font-semibold">{p.name}</div>
            <div className="text-2xl font-bold mt-1">
              {p.price.toLocaleString()} Tsh
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Tap to Purchase
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center">
          <div className="bg-white px-6 py-4 rounded shadow">
            Preparing checkout...
          </div>
        </div>
      )}
    </div>
  );
}
