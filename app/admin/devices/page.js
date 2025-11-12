"use client";

import useSWR, { mutate } from "swr";
import { useEffect, useMemo, useState } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";
import AlertModal from "@/components/admin/AlertModal";

const fetcher = (url) =>
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject()));

function EditLocationModal({ open, onClose, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [status, setStatus] = useState(initial?.status || "Active");
  const [partnerId, setPartnerId] = useState(initial?.partner?.id || "");
  const [routerApiUrl, setRouterApiUrl] = useState(initial?.routerApiUrl || "");
  const [routerApiUsername, setRouterApiUsername] = useState(
    initial?.routerApiUsername || ""
  );
  const [routerApiPassword, setRouterApiPassword] = useState(""); // Don't pre-fill password for security
  const [activationMethod, setActivationMethod] = useState(
    initial?.activationMethod || "mikrotik-api"
  );
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const { data: partners } = useSWR(
    "/api/v1/admin/partners?limit=1000",
    fetcher
  );

  useEffect(() => {
    setName(initial?.name || "");
    setStatus(initial?.status || "Active");
    setPartnerId(initial?.partner?.id || "");
    setRouterApiUrl(initial?.routerApiUrl || "");
    setRouterApiUsername(initial?.routerApiUsername || "");
    setRouterApiPassword(""); // Don't pre-fill password
    setActivationMethod(initial?.activationMethod || "mikrotik-api");
  }, [initial]);

  if (!open) return null;

  const save = async () => {
    setLoading(true);
    const body = {
      name,
      status,
      partnerId,
      routerApiUrl,
      routerApiUsername,
      activationMethod,
    };
    // Only include password if it was entered (to avoid overwriting with empty string)
    if (routerApiPassword) {
      body.routerApiPassword = routerApiPassword;
    }
    const res = await fetch(`/api/v1/admin/locations/${initial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setAlertMsg(j.message || "Update failed");
      setAlertOpen(true);
      return false;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="w-full max-w-lg bg-card text-card-foreground border rounded-md shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Location</h3>
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
            <label className="block text-sm mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Assign to Partner</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
            >
              <option value="">Select a Partner...</option>
              {(partners?.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <hr className="my-2" />
          <h4 className="text-sm font-semibold text-muted-foreground">
            MikroTik API Configuration
          </h4>

          <div>
            <label className="block text-sm mb-1">Activation Method</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={activationMethod}
              onChange={(e) => setActivationMethod(e.target.value)}
            >
              <option value="mikrotik-api">
                MikroTik REST API (Recommended)
              </option>
              <option value="radius">RADIUS</option>
              <option value="auto">Auto-detect</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              MikroTik API provides instant activation without RADIUS setup
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Router API URL</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="https://192.168.88.1"
              value={routerApiUrl}
              onChange={(e) => setRouterApiUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              HTTPS URL of the MikroTik router
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Router API Username</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="api-admin"
              value={routerApiUsername}
              onChange={(e) => setRouterApiUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Router API Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Leave empty to keep existing password"
              value={routerApiPassword}
              onChange={(e) => setRouterApiPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Password is encrypted before storage
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="px-3 py-2 rounded-md border" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            disabled={loading || !name || !partnerId}
            onClick={async () => {
              const ok = await save();
              if (ok) {
                mutate(
                  (key) =>
                    typeof key === "string" &&
                    key.startsWith("/api/v1/admin/locations")
                );
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

function CreateLocationModal({ open, onClose }) {
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [routerApiUrl, setRouterApiUrl] = useState("");
  const [routerApiUsername, setRouterApiUsername] = useState("");
  const [routerApiPassword, setRouterApiPassword] = useState("");
  const [activationMethod, setActivationMethod] = useState("mikrotik-api");
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const { data: partners } = useSWR(
    "/api/v1/admin/partners?limit=1000",
    fetcher
  );

  if (!open) return null;

  const save = async () => {
    setLoading(true);
    const res = await fetch("/api/v1/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        routerModel: model,
        routerIdentifier: identifier,
        partnerId,
        routerApiUrl,
        routerApiUsername,
        routerApiPassword,
        activationMethod,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setAlertMsg(
        typeof j.message === "string"
          ? j.message
          : JSON.stringify(j.message || j)
      );
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
              {(partners?.data || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <hr className="my-2" />
          <h4 className="text-sm font-semibold text-muted-foreground">
            MikroTik API Configuration
          </h4>

          <div>
            <label className="block text-sm mb-1">Activation Method</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={activationMethod}
              onChange={(e) => setActivationMethod(e.target.value)}
            >
              <option value="mikrotik-api">
                MikroTik REST API (Recommended)
              </option>
              <option value="radius">RADIUS</option>
              <option value="auto">Auto-detect</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              MikroTik API provides instant activation without RADIUS setup
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Router API URL</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="https://192.168.88.1"
              value={routerApiUrl}
              onChange={(e) => setRouterApiUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              HTTPS URL of the MikroTik router (usually https://192.168.88.1)
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Router API Username</label>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="api-admin"
              value={routerApiUsername}
              onChange={(e) => setRouterApiUsername(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Create a user with API access on the router
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1">Router API Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              placeholder="Enter API password"
              value={routerApiPassword}
              onChange={(e) => setRouterApiPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Password is encrypted before storage
            </p>
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
              const ok = await save();
              if (ok) {
                mutate(
                  (key) =>
                    typeof key === "string" &&
                    key.startsWith("/api/v1/admin/locations")
                );
                onClose();
              }
            }}
          >
            {loading ? "Saving..." : "Save Location"}
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

export default function DevicesPage() {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toEdit, setToEdit] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const { data, error, isLoading } = useSWR(
    `/api/v1/admin/locations?search=${encodeURIComponent(query)}`,
    fetcher
  );
  const rows = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mt-4">
        <input
          placeholder="Search by location name..."
          className="w-72 border rounded px-3 py-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded-md bg-primary text-primary-foreground"
          onClick={() => setCreateOpen(true)}
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3" colSpan={5}>
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-red-600 px-4 py-3">
                  Failed to load locations.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  No Locations Found
                </td>
              </tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30 border-t">
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3">{l.partner?.name}</td>
                  <td className="px-4 py-3">{l.routerIdentifier}</td>
                  <td className="px-4 py-3">{l.status}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        setToEdit(l);
                        setEditOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-yellow-700 hover:underline"
                      onClick={async () => {
                        // Toggle Active/Inactive quickly
                        await fetch(`/api/v1/admin/locations/${l.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            status:
                              l.status === "Active" ? "Inactive" : "Active",
                          }),
                        });
                        mutate(
                          (key) =>
                            typeof key === "string" &&
                            key.startsWith("/api/v1/admin/locations")
                        );
                      }}
                    >
                      {l.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => {
                        setConfirmTarget(l);
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

      <CreateLocationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditLocationModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={toEdit}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Remove Location?"
        description="This will permanently delete the location. This action cannot be undone."
        variant="danger"
        confirmText="Remove"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          const l = confirmTarget;
          setConfirmOpen(false);
          if (!l) return;
          const res = await fetch(`/api/v1/admin/locations/${l.id}`, {
            method: "DELETE",
          });
          if (!res.ok) return;
          mutate(
            (key) =>
              typeof key === "string" &&
              key.startsWith("/api/v1/admin/locations")
          );
        }}
      />
    </div>
  );
}
