"use client";

import { mockServicePackages } from "@/lib/mockApi";
import { useState } from "react";

function PackageModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [duration, setDuration] = useState(initial?.durationMinutes ?? 60);
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-md shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initial ? `Edit Package` : "Create Package"}
          </h3>
          <button className="text-sm hover:underline" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Price (Tsh)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (minutes)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-md border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={loading || !name || price < 0 || duration <= 0}
            onClick={async () => {
              setLoading(true);
              await new Promise((r) => setTimeout(r, 600));
              onSave({ name, price, durationMinutes: duration });
              setLoading(false);
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

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
        <div />
        <button
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Create Package
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {mockServicePackages.map((p) => (
          <div key={p.id} className="border rounded-md p-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.durationMinutes} minutes
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-semibold">
                  {p.price.toLocaleString()} Tsh
                </div>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PackageModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
        onSave={() => {
          setOpen(false);
          setToast("Package saved.");
          setTimeout(() => setToast(""), 2000);
        }}
      />
    </div>
  );
}
