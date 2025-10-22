"use client";

export default function AlertModal({
  open,
  title = "Notice",
  description = "",
  variant = "primary", // "primary" | "danger" | "warning"
  onClose,
}) {
  if (!open) return null;
  const color =
    variant === "danger"
      ? "bg-red-600 text-white"
      : variant === "warning"
      ? "bg-yellow-500 text-black"
      : "bg-primary text-primary-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-md border bg-card p-5 shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
          {description}
        </div>
        <div className="flex justify-end mt-5">
          <button className={`px-3 py-2 rounded-md ${color}`} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
