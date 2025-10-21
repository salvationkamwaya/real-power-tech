"use client";

import { mockLocations, mockPartners } from "@/lib/mockApi";
import { useMemo, useState } from "react";

function LocationModal({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-md shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Register New Hotspot Location
          </h3>
          <button className="text-sm hover:underline" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-3">
          <div>
            <label className="block text-sm mb-1">Location Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Router Model</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Router Identifier (MAC)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Assign to Partner</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            >
              <option value="">Select a Partner...</option>
              {mockPartners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-md border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={loading || !name || !identifier || !partnerId}
            onClick={async () => {
              setLoading(true);
              await new Promise((r) => setTimeout(r, 600));
              onSave({ name, model, identifier, partnerId });
              setLoading(false);
            }}
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    return mockLocations.filter((l) =>
      l.name.toLowerCase().includes(query.toLowerCase())
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
          placeholder="Search by location name..."
          className="w-72 border rounded px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground"
          onClick={() => setOpen(true)}
        >
          Add New Location
        </button>
      </div>

      <div className="mt-4 border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left">
              <th className="px-4 py-3">Location Name</th>
              <th className="px-4 py-3">Assigned Partner</th>
              <th className="px-4 py-3">Router Identifier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  No Locations Found
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30 border-t">
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3">{l.partner.name}</td>
                  <td className="px-4 py-3">{l.routerIdentifier}</td>
                  <td className="px-4 py-3">{l.status}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline mr-3">
                      Edit
                    </button>
                    <button className="text-yellow-700 hover:underline mr-3">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LocationModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={() => {
          setOpen(false);
          setToast("Location saved successfully.");
          setTimeout(() => setToast(""), 2000);
        }}
      />
    </div>
  );
}
