import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") return String(value);
  if (Array.isArray(value))
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${k}:${stableStringify(value[k])}`).join(",")}}`;
}

export function clickpesaChecksum(secret, payload) {
  const sorted = Object.keys(payload)
    .sort()
    .reduce((acc, k) => {
      acc[k] = payload[k];
      return acc;
    }, {});
  const str = Object.values(sorted)
    .map((v) => (typeof v === "string" ? v : stableStringify(v)))
    .join("");
  const hmac = crypto.createHmac("sha256", secret || "");
  hmac.update(str);
  return hmac.digest("hex");
}

// Normalize MAC to uppercase colon-separated (AA:BB:CC:DD:EE:FF)
export function normalizeMac(mac) {
  if (!mac) return mac;
  const hex = mac.replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  if (hex.length !== 12) return mac.toUpperCase();
  return hex.match(/.{1,2}/g).join(":");
}
