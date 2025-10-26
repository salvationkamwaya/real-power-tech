"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PortalSuccessContent() {
  const sp = useSearchParams();
  const orderReference = sp.get("orderReference");
  const fallbackDuration = sp.get("duration");

  const [status, setStatus] = useState("Pending");
  const [durationMinutes, setDurationMinutes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer;
    let attempts = 0;

    async function fetchStatus() {
      if (!orderReference) return;
      try {
        const res = await fetch(
          `/api/v1/portal/transactions/${orderReference}`
        );
        if (!res.ok) throw new Error("Unable to verify payment");
        const j = await res.json();
        setStatus(j.status);
        if (j.package?.durationMinutes)
          setDurationMinutes(j.package.durationMinutes);
        if (j.status === "Completed" || j.status === "Failed") return; // stop
      } catch (e) {
        setError((e && e.message) || "Verification failed");
      }
      attempts += 1;
      if (attempts < 15) {
        timer = setTimeout(fetchStatus, 2000);
      }
    }

    if (orderReference) fetchStatus();
    return () => clearTimeout(timer);
  }, [orderReference]);

  const durationLabel = useMemo(() => {
    const mins =
      durationMinutes ?? (fallbackDuration ? Number(fallbackDuration) : NaN);
    if (!Number.isFinite(mins)) return undefined;
    if (mins >= 1440) return `${Math.round(mins / 1440)} Day(s)`;
    if (mins >= 60) return `${Math.round(mins / 60)} Hour(s)`;
    return `${Math.max(1, Math.round(mins))} Minutes`;
  }, [durationMinutes, fallbackDuration]);

  return (
    <div className="min-h-screen grid place-items-center bg-white p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 grid place-items-center mb-4">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke={status === "Completed" ? "#28A745" : "#6C757D"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold mb-2">
          {status === "Completed"
            ? "You are connected!"
            : status === "Failed"
            ? "Payment failed"
            : "Finalizing your payment..."}
        </h1>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <p className="text-muted-foreground">
          {status === "Completed"
            ? `Your session is ${
                durationLabel || "active"
              }. You can now close this page and browse the internet.`
            : status === "Failed"
            ? "Your payment could not be completed. Please go back and try again."
            : "Please wait while we confirm your payment. This may take a few seconds."}
        </p>
        {orderReference && (
          <p className="text-xs text-muted-foreground mt-3">
            Reference: {orderReference}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PortalSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-white p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 grid place-items-center mb-4 animate-pulse" />
            <div className="h-8 bg-muted rounded mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
      }
    >
      <PortalSuccessContent />
    </Suspense>
  );
}
