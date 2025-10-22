import { clickpesaChecksum } from "@/lib/utils";

const BASE_URL =
  process.env.CLICKPESA_BASE_URL || "https://api.clickpesa.com/third-parties";
const CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const API_KEY = process.env.CLICKPESA_API_KEY;
const CHECKSUM_KEY = process.env.CLICKPESA_CHECKSUM_KEY || "";

let cachedToken = null;
let tokenExpiry = 0; // epoch ms

async function generateToken() {
  const res = await fetch(`${BASE_URL}/generate-token`, {
    method: "POST",
    headers: {
      "client-id": CLIENT_ID || "",
      "api-key": API_KEY || "",
    },
  });
  if (!res.ok) throw new Error(`ClickPesa token error: ${res.status}`);
  const data = await res.json();
  // token format already includes "Bearer " prefix per docs
  return data.token;
}

export async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;
  const token = await generateToken();
  cachedToken = token;
  tokenExpiry = now + 55 * 60 * 1000; // 55 minutes safety window
  return token;
}

function withChecksum(payload) {
  if (!CHECKSUM_KEY) return payload;
  const checksum = clickpesaChecksum(CHECKSUM_KEY, payload);
  return { ...payload, checksum };
}

export async function previewUssdPush({
  amount,
  currency,
  orderReference,
  phoneNumber,
  fetchSenderDetails = false,
}) {
  const token = await getAuthToken();
  const body = withChecksum({
    amount: String(amount),
    currency,
    orderReference,
    phoneNumber,
    fetchSenderDetails,
  });
  const res = await fetch(`${BASE_URL}/payments/preview-ussd-push-request`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`USSD preview failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function initiateUssdPush({
  amount,
  currency,
  orderReference,
  phoneNumber,
}) {
  const token = await getAuthToken();
  const body = withChecksum({
    amount: String(amount),
    currency,
    orderReference,
    phoneNumber,
  });
  const res = await fetch(`${BASE_URL}/payments/initiate-ussd-push-request`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`USSD initiate failed: ${res.status} ${err}`);
  }
  return res.json();
}

// Hosted Checkout: Generate checkout link
export async function createCheckoutLink({
  totalPrice,
  orderReference,
  orderCurrency,
  customerName,
  customerEmail,
  customerPhone,
  description,
}) {
  const token = await getAuthToken();
  const payload = withChecksum({
    totalPrice: String(totalPrice),
    orderReference,
    orderCurrency,
    ...(customerName ? { customerName } : {}),
    ...(customerEmail ? { customerEmail } : {}),
    ...(customerPhone ? { customerPhone } : {}),
    ...(description ? { description } : {}),
  });
  const res = await fetch(`${BASE_URL}/checkout-link/generate-checkout-url`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Checkout link failed: ${res.status} ${err}`);
  }
  return res.json(); // { checkoutLink, clientId }
}

export async function queryPaymentStatus(orderReference) {
  const token = await getAuthToken();
  const res = await fetch(
    `${BASE_URL}/payments/${encodeURIComponent(orderReference)}`,
    {
      method: "GET",
      headers: { Authorization: token },
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Query payment failed: ${res.status} ${err}`);
  }
  return res.json();
}
