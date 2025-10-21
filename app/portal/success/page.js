"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export default function PortalSuccessPage() {
  const sp = useSearchParams();

  const duration = useMemo(() => {
    const raw = sp.get("duration");
    const mins = Number(raw ?? "60");
    if (Number.isNaN(mins)) return "60 Minutes";
    if (mins >= 1440) return `${Math.round(mins / 1440)} Day(s)`;
    if (mins >= 60) return `${Math.round(mins / 60)} Hour(s)`;
    return `${mins} Minutes`;
  }, [sp]);

  return (
    <div className="min-h-screen grid place-items-center bg-white p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-green-100 grid place-items-center mb-4">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#28A745"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold mb-2">You are connected!</h1>
        <p className="text-muted-foreground">
          Your session is valid for {duration}. You can now close this page and
          browse the internet.
        </p>
      </div>
    </div>
  );
}
