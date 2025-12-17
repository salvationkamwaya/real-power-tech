import { clickpesaChecksum } from "@/lib/utils";

const BASE_URL =
  process.env.CLICKPESA_BASE_URL || "https://api.clickpesa.com/third-parties";
const CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const API_KEY = process.env.CLICKPESA_API_KEY;
const CHECKSUM_KEY = process.env.CLICKPESA_CHECKSUM_KEY || "";

let cachedToken = null;
let tokenExpiry = 0; // epoch ms

async function generateToken() {
  console.log('[ClickPesa] Generating token...', {
    baseUrl: BASE_URL,
    clientIdPresent: !!CLIENT_ID,
    apiKeyPresent: !!API_KEY,
  });
  
  const res = await fetch(`${BASE_URL}/generate-token`, {
    method: "POST",
    headers: {
      "client-id": CLIENT_ID || "",
      "api-key": API_KEY || "",
    },
  });
  
  if (!res.ok) {
    const errText = await res.text();
    console.error('[ClickPesa] Token generation failed:', res.status, errText);
    throw new Error(`ClickPesa token error: ${res.status} ${errText}`);
  }
  
  const data = await res.json();
  console.log('[ClickPesa] Token generated successfully');
  
  // Ensure token has "Bearer " prefix
  let token = data.token;
  if (token && !token.startsWith('Bearer ')) {
    console.log('[ClickPesa] Adding Bearer prefix to token');
    token = `Bearer ${token}`;
  }
  
  return token;
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
  
  // Build payload - phoneNumber is REQUIRED per ClickPesa docs
  if (!phoneNumber) {
    throw new Error("phoneNumber is required for preview USSD push");
  }
  
  const body = withChecksum({
    amount: String(amount),
    currency,
    orderReference,
    phoneNumber: String(phoneNumber),
    fetchSenderDetails,
  });
  
  console.log('[ClickPesa] Preview USSD request:', { 
    endpoint: `${BASE_URL}/payments/preview-ussd-push-request`,
    payload: { ...body, checksum: body.checksum ? '***' : undefined }
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
    console.error('[ClickPesa] Preview failed:', res.status, err);
    throw new Error(`USSD preview failed: ${res.status} ${err}`);
  }
  
  const result = await res.json();
  console.log('[ClickPesa] Preview success:', result);
  return result;
}

export async function initiateUssdPush({
  amount,
  currency,
  orderReference,
  phoneNumber,
}) {
  const token = await getAuthToken();
  
  if (!phoneNumber) {
    throw new Error("phoneNumber is required for initiate USSD push");
  }
  
  const body = withChecksum({
    amount: String(amount),
    currency,
    orderReference,
    phoneNumber: String(phoneNumber),
  });
  
  console.log('[ClickPesa] Initiate USSD request:', { 
    endpoint: `${BASE_URL}/payments/initiate-ussd-push-request`,
    payload: { ...body, checksum: body.checksum ? '***' : undefined }
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
    console.error('[ClickPesa] Initiate failed:', res.status, err);
    throw new Error(`USSD initiate failed: ${res.status} ${err}`);
  }
  
  const result = await res.json();
  console.log('[ClickPesa] Initiate success:', result);
  return result;
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
