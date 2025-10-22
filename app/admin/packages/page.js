"use client";

import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import AlertModal from "@/components/admin/AlertModal";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

function PackageModal({ open, onClose, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [duration, setDuration] = useState(initial?.durationMinutes ?? 60);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setName(initial?.name || "");
    setPrice(initial?.price ?? 0);
    setDuration(initial?.durationMinutes ?? 60);
  }, [initial]);

  if (!open) return null;

  const save = async () => {
    setLoading(true);
    const res = await fetch(
      isEdit
        ? `/api/v1/admin/packages/${initial.id}`
        : "/api/v1/admin/packages",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          durationMinutes: Number(duration),
        }),
      }
    );
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setAlertMsg(j.message || "Save failed");
      setAlertOpen(true);
      return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-md shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit ? `Edit Package` : "Create Package"}
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
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (minutes)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-md border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={!name || price < 0 || duration <= 0 || loading}
            onClick={async () => {
              const ok = await save();
              if (ok) {
                mutate("/api/v1/admin/packages");
                onClose();
              }
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
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

export default function PackagesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, error, isLoading } = useSWR("/api/v1/admin/packages", fetcher);

  return (
    <div>
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
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded" />
          ))
        ) : error ? (
          <div className="text-red-600">Failed to load packages.</div>
        ) : (
          (data || []).map((p) => (
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
          ))
        )}
      </div>

      <PackageModal
        open={open}
        initial={editing}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
