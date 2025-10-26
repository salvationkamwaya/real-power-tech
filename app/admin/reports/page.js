"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

export default function ReportsPage() {
  const [partnerId, setPartnerId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const { data: partnersRes } = useSWR(
    "/api/v1/admin/partners?limit=1000",
    fetcher
  );
  const partners = partnersRes?.data || [];

  const canGenerate = partnerId && start && end && !loading;

  const totalFormatted = useMemo(
    () => (report?.summary?.totalRevenueGenerated ?? 0).toLocaleString(),
    [report]
  );
  const partnerPayoutFormatted = useMemo(
    () => (report?.summary?.partnerPayoutAmount ?? 0).toLocaleString(),
    [report]
  );
  const operatorShareFormatted = useMemo(
    () => (report?.summary?.operatorShareAmount ?? 0).toLocaleString(),
    [report]
  );

  async function handleGenerate() {
    setError("");
    setReport(null);
    if (!canGenerate) {
      setError("Please select a partner and a valid date range.");
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        partnerId,
        startDate: start,
        endDate: end,
      });
      const res = await fetch(`/api/v1/admin/reports?${params.toString()}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Could not fetch report data");
      }
      const j = await res.json();
      setReport(j);
    } catch (e) {
      setError(e.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4 mt-4">
        <div className="md:col-span-1">
          <label className="block text-sm mb-1">Select a Partner</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
          >
            <option value="">Select a Partner...</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Start Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">End Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Report Output */}
      <div className="mt-6">
        {!report && !loading && (
          <div className="text-muted-foreground text-sm">
            Select a partner and date range, then click Generate Report.
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className="h-24 rounded bg-muted animate-pulse" />
            <div className="h-48 rounded bg-muted animate-pulse" />
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Header */}
            <div className="border rounded-md bg-card p-4">
              <h2 className="text-xl font-semibold">Payout Report</h2>
              <div className="text-sm text-muted-foreground mt-1">
                Partner: {report.reportMetadata.partnerName || "-"}
              </div>
              <div className="text-sm text-muted-foreground">
                Period:{" "}
                {new Date(report.reportMetadata.startDate).toLocaleDateString()}{" "}
                to{" "}
                {new Date(report.reportMetadata.endDate).toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Generated at:{" "}
                {new Date(report.reportMetadata.generatedAt).toLocaleString()}
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-md border p-4">
                <div className="text-sm text-muted-foreground">
                  Total Revenue Generated
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {totalFormatted} Tsh
                </div>
              </div>
              <div className="bg-card rounded-md border p-4">
                <div className="text-sm text-muted-foreground">
                  Partner&apos;s Share ({report.summary.revenueSharePercentage}
                  %)
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {partnerPayoutFormatted} Tsh
                </div>
              </div>
              <div className="bg-card rounded-md border p-4">
                <div className="text-sm text-muted-foreground">
                  Operator&apos;s Share
                </div>
                <div className="text-2xl font-semibold mt-1">
                  {operatorShareFormatted} Tsh
                </div>
              </div>
            </div>

            {/* Highlighted Payout */}
            <div className="border-2 border-green-300 rounded-md p-4 bg-green-50">
              <div className="text-lg font-semibold text-green-800">
                Partner Payout Amount
              </div>
              <div className="text-3xl font-bold text-green-700 mt-1">
                {partnerPayoutFormatted} Tsh
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left">
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No transactions were found for this partner in the
                        selected period.
                      </td>
                    </tr>
                  ) : (
                    report.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-muted/30 border-t">
                        <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                        <td className="px-4 py-3">
                          {new Date(t.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{t.locationName}</td>
                        <td className="px-4 py-3">{t.packageName}</td>
                        <td className="px-4 py-3">
                          {(t.amount || 0).toLocaleString()} Tsh
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {report.transactions.length > 0 && (
                  <tfoot>
                    <tr className="border-t font-semibold">
                      <td className="px-4 py-3" colSpan={4}>
                        Total:
                      </td>
                      <td className="px-4 py-3">{totalFormatted} Tsh</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
