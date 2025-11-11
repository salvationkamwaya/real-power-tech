"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PortalSuccessContent() {
  const sp = useSearchParams();
  const orderReference = sp.get("orderReference");
  const fallbackDuration = sp.get("duration");

  const [status, setStatus] = useState("Pending");
  const [durationMinutes, setDurationMinutes] = useState(null);
  const [error, setError] = useState("");
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [manualLoginClicked, setManualLoginClicked] = useState(false);
  const [mac, setMac] = useState(null); // MAC from transaction API (most reliable source)

  // Try to get MAC from localStorage as additional fallback
  useEffect(() => {
    try {
      const storedMac = window.localStorage.getItem("customerMacAddress");
      if (storedMac && !mac) {
        console.log("Found MAC in localStorage:", storedMac);
        setMac(storedMac);
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
  }, [mac]);

  // Auto-login function
  const triggerHotspotLogin = useCallback(() => {
    if (!mac) {
      console.warn("No MAC address available for login");
      return;
    }

    // Normalize MAC address (uppercase with colons)
    const normalizedMac = mac.toUpperCase().replace(/[:-]/g, ":");

    // MikroTik hotspot login URL (assuming standard IP)
    const hotspotIP = "192.168.88.1";
    const loginUrl = `http://${hotspotIP}/login?username=${encodeURIComponent(
      normalizedMac
    )}&password=`;

    console.log("Triggering hotspot login for MAC:", normalizedMac);

    // Create hidden iframe to trigger login without leaving the page
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = loginUrl;
    document.body.appendChild(iframe);

    // Remove iframe after 3 seconds
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 3000);
  }, [mac]);

  // Handle manual login button click
  const handleManualLogin = () => {
    setManualLoginClicked(true);
    triggerHotspotLogin();
  };

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

        // Extract MAC address from transaction (MOST RELIABLE SOURCE - from database)
        if (j.customerMacAddress) {
          console.log(
            "MAC address from transaction API:",
            j.customerMacAddress
          );
          setMac(j.customerMacAddress);

          // Also store in localStorage for additional redundancy
          try {
            window.localStorage.setItem(
              "customerMacAddress",
              j.customerMacAddress
            );
          } catch (e) {
            console.warn("Could not save to localStorage:", e);
          }
        }

        // Auto-login when payment is completed and MAC is available
        if (j.status === "Completed" && !loginAttempted && mac) {
          setLoginAttempted(true);
          console.log(
            "Payment completed, triggering auto-login in 2 seconds..."
          );
          // Wait 2 seconds before auto-login to ensure payment is fully processed
          setTimeout(() => {
            triggerHotspotLogin();
          }, 2000);
        }

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
  }, [orderReference, loginAttempted, mac, triggerHotspotLogin]);

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
            ? `Your session is ${durationLabel || "active"}. ${
                loginAttempted
                  ? "Connecting you automatically..."
                  : "You can now access the internet."
              }`
            : status === "Failed"
            ? "Your payment could not be completed. Please go back and try again."
            : "Please wait while we confirm your payment. This may take a few seconds."}
        </p>

        {/* Manual Connect Button - shown when payment is completed */}
        {status === "Completed" && mac && (
          <div className="mt-6">
            <button
              onClick={handleManualLogin}
              disabled={manualLoginClicked}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {manualLoginClicked ? "Connecting..." : "Connect Now"}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              {loginAttempted
                ? "Auto-connecting... Click above if not connected in 5 seconds"
                : "Click to connect to the internet"}
            </p>
          </div>
        )}

        {/* Show warning if MAC address is missing */}
        {status === "Completed" && !mac && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Device information not detected. Please reconnect to the WiFi
              network to access the internet.
            </p>
          </div>
        )}

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
