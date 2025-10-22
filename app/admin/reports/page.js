"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

function SummaryCard({ label, value }) {
  return (
    <div className="bg-card text-card-foreground rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [partnerId, setPartnerId] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const { data: partnersRes } = useSWR(
    "/api/v1/admin/partners?limit=1000",
    fetcher
  );
  const partners = partnersRes?.data || [];

  const handleGenerate = async () => {
    setError("");
    if (!partnerId || !dateRange.start || !dateRange.end) {
      setError("Please select a partner and a valid date range.");
      return;
    }
    setLoading(true);
    // Temporary mocked output until M4 real reports API
    await new Promise((r) => setTimeout(r, 600));

    const selected = partners.find((p) => p.id === partnerId);
    const partnerName = `${selected.firstName} ${selected.lastName}`;
    const partnerShare = selected.revenueSharePercentage;

    const baseRows = [
      {
        id: "t1",
        timestamp: new Date().toISOString(),
        locationName: "Sample Location",
        packageName: "1-Hour Access",
        amount: 1000,
      },
    ];

    const totalRevenueGenerated = baseRows.reduce((s, r) => s + r.amount, 0);
    const partnerPayoutAmount = Math.round(
      (totalRevenueGenerated * partnerShare) / 100
    );
    const operatorShareAmount = totalRevenueGenerated - partnerPayoutAmount;

    setReport({
      reportMetadata: {
        partnerName,
        startDate: dateRange.start,
        endDate: dateRange.end,
        generatedAt: new Date().toISOString(),
      },
      summary: {
        totalRevenueGenerated,
        revenueSharePercentage: partnerShare,
        partnerPayoutAmount,
        operatorShareAmount,
      },
      transactions: baseRows,
    });
    setLoading(false);
  };

  const totalFormatted = useMemo(
    () => report?.summary.totalRevenueGenerated?.toLocaleString(),
    [report]
  );

  return (
    <div>
      {/* Page title shown by Admin layout */}

      {/* Controls */}
      <div className="mt-4 bg-card border rounded-md p-4">
        {error && (
          <div className="mb-3 p-2 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-sm mb-1">Select a Partner</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            >
              <option value="">Select a Partner...</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.revenueSharePercentage}%)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((d) => ({ ...d, start: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">End Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((d) => ({ ...d, end: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report Output */}
      {!report ? (
        <div className="text-center text-muted-foreground py-16">
          Select a partner and date range, then click Generate Report.
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section className="bg-card border rounded-md p-4">
            <h2 className="text-xl font-semibold">Payout Report</h2>
            <div className="text-sm mt-1">
              <div>
                Partner:{" "}
                <span className="font-medium">
                  {report.reportMetadata.partnerName}
                </span>
              </div>
              <div>
                Period: {report.reportMetadata.startDate} to{" "}
                {report.reportMetadata.endDate}
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-4">
            <SummaryCard
              label="Total Revenue Generated"
              value={`${totalFormatted} Tsh`}
            />
            <SummaryCard
              label={`Partner's Share (${report.summary.revenueSharePercentage}%)`}
              value={`${report.summary.partnerPayoutAmount.toLocaleString()} Tsh`}
            />
            <SummaryCard
              label="Operator's Share"
              value={`${report.summary.operatorShareAmount.toLocaleString()} Tsh`}
            />
            <SummaryCard
              label="Transactions"
              value={report.transactions.length}
            />
          </section>

          <section className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="px-4 py-3">Transaction ID</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Location Name</th>
                  <th className="px-4 py-3">Package Purchased</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 border-t">
                    <td className="px-4 py-3">{t.id}</td>
                    <td className="px-4 py-3">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{t.locationName}</td>
                    <td className="px-4 py-3">{t.packageName}</td>
                    <td className="px-4 py-3">
                      {t.amount.toLocaleString()} Tsh
                    </td>
                  </tr>
                ))}
                <tr className="border-t font-semibold">
                  <td className="px-4 py-3" colSpan={4}>
                    Total:
                  </td>
                  <td className="px-4 py-3">{totalFormatted} Tsh</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}
