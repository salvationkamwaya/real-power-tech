"use client";

import useSWR from "swr";
import { useState, Suspense } from "react";
import AlertModal from "@/components/admin/AlertModal";
import { useSearchParams } from "next/navigation";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

function PortalContent() {
  const { data, error, isLoading } = useSWR("/api/v1/portal/packages", fetcher);
  const packages = data || [];
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const sp = useSearchParams();
  const mac = sp.get("mac");
  const router = sp.get("router") || sp.get("routerIdentifier");

  async function startHosted(pkg) {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/portal/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          customerMacAddress: mac || undefined,
          routerIdentifier: router || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Checkout failed");
      }
      const j = await res.json();
      try {
        if (j.orderReference && typeof window !== "undefined") {
          window.sessionStorage.setItem("lastOrderReference", j.orderReference);
        }
      } catch (_) {}
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

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
          <div className="text-2xl font-bold mb-2">REAL POWERTECH LTD</div>
          <div className="w-full max-w-md grid gap-3 mt-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}
