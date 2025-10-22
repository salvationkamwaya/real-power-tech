"use client";

export default function AlertModal({
  open,
  title = "Notice",
  description = "",
  buttonText = "OK",
  variant = "primary", // "primary" | "danger"
  onClose,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-md border bg-card p-5 shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        ) : null}
        <div className="flex justify-end gap-2 mt-5">
          <button
            className={
              variant === "danger"
                ? "px-3 py-2 rounded-md bg-red-600 text-white"
                : "px-3 py-2 rounded-md bg-primary text-primary-foreground"
            }
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
