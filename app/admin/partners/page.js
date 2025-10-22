"use client";

import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AlertModal from "@/components/admin/AlertModal";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

function PartnerModal({ open, onClose, initial }) {
  const [firstName, setFirstName] = useState(initial?.firstName || "");
  const [lastName, setLastName] = useState(initial?.lastName || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [share, setShare] = useState(initial?.revenueSharePercentage ?? 40);
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    setFirstName(initial?.firstName || "");
    setLastName(initial?.lastName || "");
    setEmail(initial?.email || "");
    setShare(initial?.revenueSharePercentage ?? 40);
  }, [initial]);

  if (!open) return null;

  const save = async () => {
    setLoading(true);
    const payload = {
      firstName,
      lastName,
      email,
      revenueSharePercentage: Number(share),
    };
    const res = await fetch(
      isEdit
        ? `/api/v1/admin/partners/${initial.id}`
        : "/api/v1/admin/partners",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setAlertMessage(j.message || "Failed to save partner");
      setAlertOpen(true);
      throw new Error("Save failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-md shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {isEdit
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
              onChange={(e) => setShare(e.target.value)}
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
              !firstName || !lastName || share < 0 || share > 100 || loading
            }
            onClick={async () => {
              try {
                await save();
                await mutate(
                  (key) =>
                    typeof key === "string" &&
                    key.startsWith("/api/v1/admin/partners")
                );
                onClose();
              } catch (_) {
                // handled by AlertModal
              }
            }}
          >
            {loading ? "Saving..." : "Save Partner"}
          </button>
        </div>
      </div>

      <AlertModal
        open={alertOpen}
        title="Error"
        description={alertMessage}
        variant="danger"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}

export default function PartnersPage() {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const { data, error, isLoading } = useSWR(
    `/api/v1/admin/partners?search=${encodeURIComponent(query)}`,
    fetcher
  );

  const rows = data?.data || [];

  return (
    <div>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3" colSpan={4}>
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="text-red-600 px-4 py-3">
                  Failed to load partners.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10">
                  No Partners Found
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 border-t">
                  <td className="px-4 py-3">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3">{p.assignedLocationsCount}</td>
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
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        setConfirmTarget(p);
                        setConfirmMessage(
                          `Remove ${p.firstName} ${p.lastName}? This action cannot be undone.`
                        );
                        setConfirmOpen(true);
                      }}
                    >
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
      />
      <ConfirmModal
        open={confirmOpen}
        title="Confirm Removal"
        description={confirmMessage}
        variant="danger"
        confirmText="Remove"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          const p = confirmTarget;
          setConfirmOpen(false);
          if (!p) return;
          const res = await fetch(`/api/v1/admin/partners/${p.id}`, {
            method: "DELETE",
          });
          if (res.status === 409) {
            const j = await res.json();
            setAlertTitle("Cannot Remove Partner");
            setAlertMessage(
              j.message || "Cannot delete partner with assigned locations."
            );
            setAlertOpen(true);
            return;
          }
          if (!res.ok) return;
          mutate(
            (key) =>
              typeof key === "string" &&
              key.startsWith("/api/v1/admin/partners")
          );
        }}
      />
      <AlertModal
        open={alertOpen}
        title={alertTitle || "Error"}
        description={alertMessage}
        variant="danger"
        onClose={() => setAlertOpen(false)}
      />
    </div>
  );
}
