"use client";

import { mockDashboardStats } from "@/lib/mockApi";
import { useEffect, useState } from "react";
import { CircleDollarSign, Users, MapPin, Building2 } from "lucide-react";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-card text-card-foreground rounded-lg p-5 shadow-sm border">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-secondary text-secondary-foreground">
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setData(mockDashboardStats);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))
        ) : (
          <>
            <StatCard
              icon={CircleDollarSign}
              label="Total Revenue"
              value={`${data.stats.totalRevenue.toLocaleString()} Tsh`}
            />
            <StatCard
              icon={Users}
              label="Total Users Connected"
              value={data.stats.totalUsersConnected}
            />
            <StatCard
              icon={MapPin}
              label="Active Locations"
              value={data.stats.activeLocations}
            />
            <StatCard
              icon={Building2}
              label="Active Partners"
              value={data.stats.activePartners}
            />
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent Transactions</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : data.recentTransactions.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-card">
            <div className="text-lg font-medium">
              No transactions have been recorded yet.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 border-t">
                    <td className="px-4 py-3">{t.locationName}</td>
                    <td className="px-4 py-3">{t.packageName}</td>
                    <td className="px-4 py-3">
                      {t.amount.toLocaleString()} Tsh
                    </td>
                    <td className="px-4 py-3">
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
