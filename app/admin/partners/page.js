"use client";

import { mockPartners } from "@/lib/mockApi";
import { useMemo, useState } from "react";

function PartnerModal({ open, onClose, onSave, initial }) {
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [share, setShare] = useState(initial?.revenueSharePercentage ?? 40);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-md shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initial
              ? `Editing ${initial.firstName} ${initial.lastName}`
              : "Add New Partner"}
          </h3>
          <button className="text-sm hover:underline" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-3">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Revenue Share %</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={share}
              onChange={(e) => setShare(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-md border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={
              loading || !firstName || !lastName || share < 0 || share > 100
            }
            onClick={async () => {
              setLoading(true);
              await new Promise((r) => setTimeout(r, 600));
              onSave({
                firstName,
                lastName,
                email,
                revenueSharePercentage: share,
              });
              setLoading(false);
            }}
          >
            {loading ? "Saving..." : "Save Partner"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    return mockPartners.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div>
      {toast && (
        <div
          className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow"
          onAnimationEnd={() => setToast("")}
        >
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <input
          placeholder="Search by partner name..."
          className="w-72 border rounded px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add New Partner
        </button>
      </div>

      <div className="mt-4 border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left">
              <th className="px-4 py-3">Partner Name</th>
              <th className="px-4 py-3">Assigned Locations</th>
              <th className="px-4 py-3">Revenue Share %</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  No Partners Found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 border-t">
                  <td className="px-4 py-3">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3">{p.locationsCount}</td>
                  <td className="px-4 py-3">{p.revenueSharePercentage}%</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-blue-600 hover:underline mr-3"
                      onClick={() => {
                        setEditing(p);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PartnerModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={() => {
          setModalOpen(false);
          setToast("Partner saved successfully.");
          setTimeout(() => setToast(""), 2000);
        }}
      />
    </div>
  );
}
