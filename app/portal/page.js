"use client";

import useSWR from "swr";
import { useState } from "react";
import AlertModal from "@/components/admin/AlertModal";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

export default function PortalPage() {
  const { data, error, isLoading } = useSWR("/api/v1/portal/packages", fetcher);
  const packages = data || [];
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  async function startHosted(pkg) {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/portal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Checkout failed");
      }
      const j = await res.json();
      window.location.href = j.paymentUrl; // redirect to hosted checkout
    } catch (e) {
      setAlertMsg(e.message || "Payment start failed");
      setAlertOpen(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="text-2xl font-bold mb-2">REAL POWERTECH LTD</div>
      <p className="text-muted-foreground mb-6 text-center">
        Select a package. You will be redirected to ClickPesa to complete
        payment.
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
          packages.map((p) => (
            <button
              key={p.id}
              className="text-left border rounded-md p-4 bg-card hover:scale-[1.02] transition transform disabled:opacity-60"
              onClick={() => startHosted(p)}
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

      <AlertModal
        open={alertOpen}
        title="Error"
        description={alertMsg}
        variant="danger"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
