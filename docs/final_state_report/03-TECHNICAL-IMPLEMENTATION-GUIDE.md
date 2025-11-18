# Technical Implementation Guide

## Real Power Tech Hotspot System

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**System Status:** ✅ PRODUCTION - WORKING

---

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Complete User Journey](#complete-user-journey)
3. [Technical Implementation Details](#technical-implementation-details)
4. [Critical Mistakes & Lessons Learned](#critical-mistakes--lessons-learned)
5. [API Integration Guide](#api-integration-guide)
6. [Database Schema](#database-schema)
7. [Payment Flow](#payment-flow)
8. [Security Considerations](#security-considerations)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────┐         ┌──────────────┐
│   End User      │────────▶│  MikroTik    │
│  Mobile/Laptop  │         │   Router     │
└─────────────────┘         └──────────────┘
                                 │
                                 │ (Hotspot Login Redirect)
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                     Next.js Portal                            │
│                  (Hosted on Vercel)                          │
│                                                               │
│  ┌────────────┐  ┌───────────┐  ┌──────────────┐           │
│  │   Portal   │  │  Payment  │  │ API Routes   │           │
│  │   Pages    │  │Integration│  │              │           │
│  └────────────┘  └───────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐      ┌──────────────┐    ┌──────────────┐
│   MongoDB    │      │  ClickPesa   │    │ Vultr VPN    │
│   Database   │      │   Payment    │    │   Server     │
└──────────────┘      │   Gateway    │    └──────────────┘
                      └──────────────┘            │
                                                  │
                                                  ▼
                                          ┌──────────────┐
                                          │  MikroTik    │
                                          │  API Access  │
                                          │  via WireG   │
                                          └──────────────┘
```

### Component Breakdown

| Component           | Technology           | Purpose                             | Host        |
| ------------------- | -------------------- | ----------------------------------- | ----------- |
| **Frontend Portal** | Next.js 15, React 19 | User interface, package selection   | Vercel      |
| **API Backend**     | Next.js API Routes   | Business logic, authentication      | Vercel      |
| **Database**        | MongoDB Atlas        | Store users, packages, transactions | Cloud       |
| **Payment Gateway** | ClickPesa API        | Process mobile money payments       | External    |
| **VPN Server**      | WireGuard + Nginx    | Secure tunnel to router API         | Vultr VPS   |
| **Hotspot Router**  | MikroTik RouterOS 7  | WiFi access point, user management  | On-premises |

---

## Complete User Journey

### Step-by-Step Flow (Working System)

```
1. USER CONNECTS TO WIFI
   │
   ├─ User searches for WiFi networks
   ├─ Finds "Real Power Tech" SSID
   └─ Connects (no password required)

2. INITIAL CONNECTION ATTEMPT
   │
   ├─ User tries to browse (e.g., google.com)
   ├─ MikroTik intercepts HTTP request
   └─ Router checks: Does MAC address have active hotspot user?
       │
       ├─ YES → Allow internet access
       └─ NO  → Redirect to hotspot login page

3. HOTSPOT LOGIN PAGE (Custom login.html on router)
   │
   ├─ Router serves /hotspot/login.html
   ├─ Custom HTML contains:
   │   const routerIdentifier = "F4:1E:57:F8:7F:0A"; // Bridge MAC
   │   const portalUrl = "https://rpt-phi.vercel.app";
   │   const redirectUrl = `${portalUrl}?mac=$(mac)&ip=$(ip)&...`;
   │
   └─ JavaScript redirects to Next.js portal with query params:
       https://rpt-phi.vercel.app?
         mac=XX:XX:XX:XX:XX:XX
         &ip=192.168.88.123
         &username=$(username)
         &linklogin=$(link-login)
         &linkorig=$(link-orig)
         &error=$(error)
         &chapid=$(chap-id)
         &chapchallenge=$(chap-challenge)
         &popupid=$(popup-id)
         &rid=F4:1E:57:F8:7F:0A  (router identifier)

4. NEXT.JS PORTAL PAGE
   │
   ├─ Portal receives query params
   ├─ Extracts user MAC, router ID, callback URL
   ├─ Checks MongoDB: Does this MAC + router have active session?
   │   │
   │   ├─ YES → Show "You're already connected" + Resume button
   │   └─ NO  → Show package selection page
   │
   └─ User sees:
       ┌─────────────────────────────┐
       │  Choose Your Package         │
       ├─────────────────────────────┤
       │  ⚡ 1 Hour  - 1,000 TZS     │
       │  ⚡ 1 Day   - 5,000 TZS     │
       │  ⚡ 1 Week  - 20,000 TZS    │
       │  ⚡ 1 Month - 50,000 TZS    │
       └─────────────────────────────┘

5. PACKAGE SELECTION
   │
   ├─ User clicks package (e.g., "1 Hour - 1,000 TZS")
   ├─ Frontend sends POST to /api/v1/portal/checkout
   │
   └─ Request body:
       {
         "packageId": "673abbf7e97e4887df2b6c27",
         "userMac": "XX:XX:XX:XX:XX:XX",
         "routerIdentifier": "F4:1E:57:F8:7F:0A",
         "phoneNumber": "255712345678",
         "redirectUrl": "http://192.168.88.1/login?..."
       }

6. CHECKOUT API PROCESSING
   │
   ├─ API validates package exists in MongoDB
   ├─ API gets router location from HotspotLocation collection
   ├─ API creates Transaction record (status: pending)
   ├─ API calls ClickPesa Checkout API:
   │   POST https://api.clickpesa.com/v1/checkout/create
   │   {
   │     "amount": 1000,
   │     "currency": "TZS",
   │     "phone_number": "255712345678",
   │     "order_reference": "TXN-1731234567890",
   │     "callback_url": "https://rpt-phi.vercel.app/api/v1/webhooks/clickpesa"
   │   }
   │
   └─ ClickPesa responds:
       {
         "checkout_request_id": "abc123",
         "status": "PENDING",
         "message": "USSD push sent"
       }

7. USER PAYMENT (Mobile Money)
   │
   ├─ User receives USSD prompt on phone: "*150*00#"
   ├─ User enters PIN to confirm payment
   ├─ Mobile money provider processes payment
   │
   └─ ClickPesa receives confirmation from provider

8. CLICKPESA WEBHOOK (Critical!)
   │
   ├─ ClickPesa sends POST to /api/v1/webhooks/clickpesa
   │   {
   │     "order_reference": "TXN-1731234567890",
   │     "status": "SUCCESS",
   │     "transaction_id": "CP123456",
   │     "amount": 1000
   │   }
   │
   ├─ Webhook API validates request
   ├─ Updates Transaction in MongoDB (status: completed)
   ├─ Gets router details from HotspotLocation
   │
   └─ **CREATES MIKROTIK HOTSPOT USER** ← CRITICAL STEP

9. MIKROTIK USER CREATION (via API)
   │
   ├─ Webhook connects to router via Vultr VPN:
   │   Vercel → Vultr:8729 → WireGuard → Router:8729
   │
   ├─ API deletes existing user (if any):
   │   DELETE https://10.99.0.2:8729/rest/ip/hotspot/user/:id
   │
   ├─ API creates new hotspot user:
   │   POST https://10.99.0.2:8729/rest/ip/hotspot/user
   │   {
   │     "name": "XX:XX:XX:XX:XX:XX",          ← User MAC
   │     "password": "XX:XX:XX:XX:XX:XX",      ← MUST MATCH MAC!
   │     "profile": "hsprof1",
   │     "limit-uptime": "1h",                  ← From package
   │     "comment": "1 Hour Package - Paid 1000 TZS",
   │     "disabled": "false",
   │     "mac-address": "XX:XX:XX:XX:XX:XX",   ← Bind to MAC
   │     "address": ""                          ← Empty (important!)
   │   }
   │
   └─ MikroTik creates user in /ip/hotspot/user

10. AUTO-LOGIN (login-auth.html on router)
    │
    ├─ Portal redirects user to: $(link-login)?username=$(mac)
    ├─ Router serves /hotspot/login-auth.html with hidden form:
    │   <form name="sendin" action="<login-url>" method="post">
    │     <input type="hidden" name="username" value="$(mac)">
    │     <input type="hidden" name="password" value="$(mac)">
    │   </form>
    │   <script>document.sendin.submit();</script>
    │
    ├─ Form auto-submits to MikroTik login URL
    │
    └─ MikroTik authenticates:
        ├─ Checks /ip/hotspot/user for username = MAC
        ├─ Verifies password = MAC
        ├─ Confirms MAC address matches
        ├─ Creates active session
        └─ Grants internet access

11. INTERNET ACCESS GRANTED ✅
    │
    ├─ User session active in /ip/hotspot/active
    ├─ NAT rules allow traffic (masquerade on ether1)
    ├─ User can browse internet for purchased duration
    │
    └─ Session expires after limit-uptime (1h)
        ├─ MikroTik automatically disconnects
        └─ User must purchase new package to reconnect
```

---

## Technical Implementation Details

### Authentication Mechanism (Deep Dive)

**How it REALLY works (as of Nov 18, 2025):**

```javascript
// MikroTik Hotspot Profile Settings
/ip hotspot profile
set hsprof1 {
  login-by=mac,http-pap,mac-cookie  // Accept MAC or PAP auth
  use-radius=no                      // DO NOT USE RADIUS!
  http-cookie-lifetime=1d
  split-user-domain=no
  html-directory=hotspot
}

// User Creation (via API after payment)
POST /rest/ip/hotspot/user
{
  "name": "AA:BB:CC:DD:EE:FF",      // Username = MAC
  "password": "AA:BB:CC:DD:EE:FF",  // Password = MAC (CRITICAL!)
  "mac-address": "AA:BB:CC:DD:EE:FF", // Bind to specific MAC
  "profile": "hsprof1",
  "limit-uptime": "1h",              // Package duration
  "address": "",                      // NO IP binding!
  "disabled": "false"
}

// IP Binding Configuration
/ip hotspot ip-binding
// Type = regular (NOT bypassed!)
// This allows dynamic IP assignment via DHCP
```

**Why this specific configuration?**

1. **`login-by=mac,http-pap,mac-cookie`**: Allows authentication via MAC address OR username/password form
2. **`use-radius=no`**: We handle auth in application, not external RADIUS server
3. **`password` = MAC address**: Critical! MikroTik checks password even for MAC auth
4. **`address=""`**: User gets dynamic IP from DHCP pool
5. **IP binding type `regular`**: Allows connection from any IP (not static)

### API Integration (MikroTik REST)

#### Connection Architecture

```
Next.js (Vercel)
    ↓
Fetch API (node-fetch)
    ↓
HTTPS Request to Vultr:8729
    ↓
Nginx Stream Proxy (Vultr)
    ↓
WireGuard VPN Tunnel
    ↓
MikroTik API :8729 (10.99.0.2)
```

#### Authentication Code

```javascript
// lib/mikrotik.js (example implementation)
import fetch from "node-fetch";
import https from "https";

// Disable SSL verification for self-signed certs
const agent = new https.Agent({
  rejectUnauthorized: false,
});

const MIKROTIK_API = {
  host: process.env.MIKROTIK_HOST, // "139.84.241.180" (Vultr public IP)
  port: process.env.MIKROTIK_PORT, // "8729"
  username: process.env.MIKROTIK_USER, // "apiuser"
  password: process.env.MIKROTIK_PASS, // "your-api-password"
};

async function apiRequest(endpoint, method = "GET", data = null) {
  const url = `https://${MIKROTIK_API.host}:${MIKROTIK_API.port}${endpoint}`;

  const auth = Buffer.from(
    `${MIKROTIK_API.username}:${MIKROTIK_API.password}`
  ).toString("base64");

  const options = {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    agent,
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MikroTik API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Get all hotspot users
export async function getHotspotUsers() {
  return apiRequest("/rest/ip/hotspot/user");
}

// Find user by MAC
export async function findUserByMac(mac) {
  const users = await apiRequest("/rest/ip/hotspot/user");
  return users.find((u) => u.name === mac || u["mac-address"] === mac);
}

// Create hotspot user
export async function createHotspotUser(userData) {
  // CRITICAL: Delete existing user first to avoid conflicts
  const existing = await findUserByMac(userData.mac);
  if (existing) {
    await apiRequest(`/rest/ip/hotspot/user/${existing[".id"]}`, "DELETE");
  }

  // Create new user
  return apiRequest("/rest/ip/hotspot/user", "POST", {
    name: userData.mac,
    password: userData.mac, // MUST match MAC!
    "mac-address": userData.mac,
    profile: "hsprof1",
    "limit-uptime": userData.duration, // e.g., "1h", "1d", "7d"
    comment: userData.comment || "",
    disabled: "false",
    address: "", // Important: leave empty!
  });
}

// Delete hotspot user
export async function deleteHotspotUser(userId) {
  return apiRequest(`/rest/ip/hotspot/user/${userId}`, "DELETE");
}

// Get active sessions
export async function getActiveSessions() {
  return apiRequest("/rest/ip/hotspot/active");
}
```

### Database Schema (MongoDB)

#### Collections

**1. HotspotLocation** (Router locations)

```javascript
{
  _id: ObjectId("673abbf7e97e4887df2b6c24"),
  name: "Main Office",
  locationName: "Real Power Tech HQ",
  routerIdentifier: "F4:1E:57:F8:7F:0A", // Bridge MAC
  apiConfig: {
    host: "139.84.241.180", // Vultr VPN endpoint
    port: "8729",
    username: "apiuser",
    password: "encrypted_password",
    protocol: "https"
  },
  isActive: true,
  createdAt: ISODate("2024-11-10T10:00:00Z"),
  updatedAt: ISODate("2025-11-18T15:30:00Z")
}
```

**2. ServicePackage** (Available packages)

```javascript
{
  _id: ObjectId("673abbf7e97e4887df2b6c27"),
  name: "1 Hour Package",
  duration: "1h", // MikroTik format
  price: 1000, // TZS
  currency: "TZS",
  description: "Perfect for quick browsing",
  isActive: true,
  sortOrder: 1,
  features: ["High-speed internet", "No data limit"],
  locationId: ObjectId("673abbf7e97e4887df2b6c24"), // Optional: location-specific
  createdAt: ISODate("2024-11-10T10:00:00Z")
}
```

**3. Transaction** (Payment records)

```javascript
{
  _id: ObjectId("673abbf7e97e4887df2b6c99"),
  orderReference: "TXN-1731234567890",
  userMac: "AA:BB:CC:DD:EE:FF",
  phoneNumber: "255712345678",
  packageId: ObjectId("673abbf7e97e4887df2b6c27"),
  locationId: ObjectId("673abbf7e97e4887df2b6c24"),
  amount: 1000,
  currency: "TZS",
  status: "completed", // pending, completed, failed, expired
  paymentProvider: "clickpesa",
  paymentDetails: {
    checkoutRequestId: "abc123",
    transactionId: "CP123456",
    paidAt: ISODate("2025-11-18T15:45:00Z")
  },
  metadata: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.88.123",
    redirectUrl: "http://192.168.88.1/login?..."
  },
  createdAt: ISODate("2025-11-18T15:40:00Z"),
  updatedAt: ISODate("2025-11-18T15:45:00Z")
}
```

---

## Critical Mistakes & Lessons Learned

### ❌ MISTAKE #1: Using FreeRADIUS for Authentication

**What we tried:**

```routeros
/ip hotspot profile
set hsprof1 use-radius=yes
```

**Why it failed:**

- FreeRADIUS was unreachable from router (network issues)
- Authentication requests timed out → no internet access
- Error logs: "RADIUS server not responding"
- Even with RADIUS running, queries failed intermittently

**Solution:**

```routeros
/ip hotspot profile
set hsprof1 use-radius=no  # Disable RADIUS completely
```

**Lesson:** Keep authentication simple. Use application-based auth via API instead of external RADIUS.

---

### ❌ MISTAKE #2: Query Syntax Error (!empty)

**What we tried:**

```javascript
// MongoDB query to find active transaction
const transaction = await Transaction.findOne({
  userMac: mac,
  locationId: locationId,
  status: 'completed',
  !empty: 'paymentDetails.paidAt'  // ❌ WRONG!
});
```

**Error:**

```
SyntaxError: Unexpected token '!'
```

**Why it failed:**

- `!empty` is not valid JavaScript or MongoDB syntax
- Tried to use pseudo-SQL syntax in MongoDB query
- Query parser rejected the syntax

**Solution:**

```javascript
// Correct MongoDB query
const transaction = await Transaction.findOne({
  userMac: mac,
  locationId: locationId,
  status: "completed",
  "paymentDetails.paidAt": { $exists: true, $ne: null }, // ✅ CORRECT
});
```

**Lesson:** Use proper MongoDB query operators: `$exists`, `$ne`, `$gt`, etc.

---

### ❌ MISTAKE #3: Missing Password Parameter

**What we tried:**

```javascript
// Creating hotspot user without password
await apiRequest("/rest/ip/hotspot/user", "POST", {
  name: userMac,
  // password: NOT SET! ❌
  "mac-address": userMac,
  profile: "hsprof1",
  "limit-uptime": "1h",
});
```

**What happened:**

- User created successfully in /ip/hotspot/user
- Login form submitted with username + password
- **Authentication FAILED** - user couldn't connect
- No error message, just stuck on login page

**Why it failed:**

- MikroTik requires password even for MAC-based auth
- When login-by includes `http-pap`, password is validated
- Missing password = failed authentication

**Solution:**

```javascript
// CORRECT: Set password = MAC address
await apiRequest("/rest/ip/hotspot/user", "POST", {
  name: userMac,
  password: userMac, // ✅ CRITICAL! Must match MAC
  "mac-address": userMac,
  profile: "hsprof1",
  "limit-uptime": "1h",
});
```

**Lesson:** **ALWAYS set password = MAC address** when creating hotspot users, even for MAC-based auth.

---

### ❌ MISTAKE #4: Wrong IP Binding Type

**What we tried:**

```routeros
/ip hotspot ip-binding
add address=192.168.88.123 mac-address=AA:BB:CC:DD:EE:FF type=bypassed
```

**Why it failed:**

- `type=bypassed` skips hotspot authentication entirely
- User gets internet without going through payment portal
- Revenue loss - free internet for everyone!

**Alternative mistake:**

```javascript
// Setting static IP in user record
{
  "address": "192.168.88.123"  // ❌ Forces specific IP
}
```

**Why it failed:**

- User's IP might change (DHCP renewal)
- User can't connect from different IP
- "IP address already in use" errors

**Solution:**

```javascript
// Correct configuration
{
  "address": "",  // ✅ Allow any IP from DHCP pool
  "mac-address": userMac  // Bind to MAC instead
}
```

```routeros
/ip hotspot ip-binding
# Use type=regular (or don't create IP binding at all)
# Let MAC address binding handle user identification
```

**Lesson:**

- Use `type=regular` for IP bindings (not `bypassed`)
- Leave `address=""` in user records to allow DHCP
- Bind users by MAC address, not IP address

---

### ❌ MISTAKE #5: Not Deleting Existing Users

**What we tried:**

```javascript
// Creating user without checking if exists
async function createUser(mac) {
  return apiRequest("/rest/ip/hotspot/user", "POST", {
    name: mac,
    password: mac,
    // ...
  });
}
```

**What happened:**

- User purchases 1-hour package → user created
- 1 hour expires → user disconnected
- User purchases another 1-hour package
- API tries to create duplicate user
- **Error: "User already exists"**
- User paid but can't connect

**Solution:**

```javascript
// CORRECT: Delete-then-create pattern
async function createUser(mac) {
  // Find existing user
  const existing = await findUserByMac(mac);

  // Delete if exists
  if (existing) {
    await apiRequest(`/rest/ip/hotspot/user/${existing[".id"]}`, "DELETE");
  }

  // Create new user (fresh time limit)
  return apiRequest("/rest/ip/hotspot/user", "POST", {
    name: mac,
    password: mac,
    "limit-uptime": duration,
    // ...
  });
}
```

**Lesson:** **Always delete existing user before creating new one** to handle repeat purchases.

---

### ✅ What WORKS (Current Implementation)

```javascript
// Complete working user creation flow
async function createHotspotUser(mac, duration, packageName, amount) {
  try {
    // 1. Find and delete existing user
    const users = await apiRequest("/rest/ip/hotspot/user");
    const existing = users.find((u) => u.name === mac);

    if (existing) {
      await apiRequest(`/rest/ip/hotspot/user/${existing[".id"]}`, "DELETE");
      console.log(`Deleted existing user: ${mac}`);
    }

    // 2. Create new user with correct parameters
    const userData = {
      name: mac, // Username = MAC
      password: mac, // Password = MAC (CRITICAL!)
      "mac-address": mac, // Bind to MAC
      profile: "hsprof1", // Hotspot profile
      "limit-uptime": duration, // e.g., "1h", "1d"
      comment: `${packageName} - Paid ${amount} TZS`,
      disabled: "false",
      address: "", // No IP binding
    };

    const result = await apiRequest("/rest/ip/hotspot/user", "POST", userData);
    console.log(`Created user: ${mac}, Duration: ${duration}`);

    return result;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
}
```

**This works because:**

1. ✅ Deletes old user first (handles repeat purchases)
2. ✅ Sets password = MAC (authentication works)
3. ✅ Leaves address empty (DHCP flexibility)
4. ✅ Binds to MAC address (user identification)
5. ✅ Uses correct profile (use-radius=no)

---

## Payment Flow (ClickPesa Integration)

### Checkout Process

```javascript
// app/api/v1/portal/checkout/route.js

export async function POST(request) {
  try {
    // 1. Parse request body
    const { packageId, userMac, routerIdentifier, phoneNumber } =
      await request.json();

    // 2. Validate package exists
    const package = await ServicePackage.findById(packageId);
    if (!package) {
      return jsonError("Package not found", 404);
    }

    // 3. Get router location
    const location = await HotspotLocation.findOne({ routerIdentifier });
    if (!location) {
      return jsonError("Router not found", 404);
    }

    // 4. Create transaction record
    const orderReference = `TXN-${Date.now()}`;
    const transaction = await Transaction.create({
      orderReference,
      userMac,
      phoneNumber,
      packageId: package._id,
      locationId: location._id,
      amount: package.price,
      currency: "TZS",
      status: "pending",
    });

    // 5. Call ClickPesa API
    const clickpesaResponse = await fetch(
      "https://api.clickpesa.com/v1/checkout/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CLICKPESA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: package.price,
          currency: "TZS",
          phone_number: phoneNumber,
          order_reference: orderReference,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/webhooks/clickpesa`,
        }),
      }
    );

    const clickpesaData = await clickpesaResponse.json();

    // 6. Return response to user
    return jsonSuccess({
      message: "Payment initiated",
      checkoutRequestId: clickpesaData.checkout_request_id,
      status: clickpesaData.status,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return jsonError("Checkout failed", 500);
  }
}
```

### Webhook Handler (CRITICAL!)

```javascript
// app/api/v1/webhooks/clickpesa/route.js

export async function POST(request) {
  try {
    // 1. Parse webhook payload
    const payload = await request.json();
    const { order_reference, status, transaction_id, amount } = payload;

    console.log("ClickPesa webhook received:", payload);

    // 2. Find transaction
    const transaction = await Transaction.findOne({
      orderReference: order_reference,
    });
    if (!transaction) {
      return jsonError("Transaction not found", 404);
    }

    // 3. Check if already processed
    if (transaction.status === "completed") {
      return jsonSuccess({ message: "Already processed" });
    }

    // 4. Verify payment status
    if (status !== "SUCCESS") {
      await transaction.updateOne({ status: "failed" });
      return jsonSuccess({ message: "Payment failed" });
    }

    // 5. Update transaction
    await transaction.updateOne({
      status: "completed",
      "paymentDetails.transactionId": transaction_id,
      "paymentDetails.paidAt": new Date(),
    });

    // 6. Get package and location details
    const package = await ServicePackage.findById(transaction.packageId);
    const location = await HotspotLocation.findById(transaction.locationId);

    // 7. ⚡ CREATE MIKROTIK USER ⚡
    await createHotspotUser(
      transaction.userMac,
      package.duration,
      package.name,
      transaction.amount,
      location.apiConfig
    );

    console.log(`✅ User created: ${transaction.userMac}`);

    return jsonSuccess({ message: "Payment processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return jsonError("Webhook processing failed", 500);
  }
}
```

**Critical Points:**

1. Webhook MUST be publicly accessible (Vercel deployment)
2. Webhook MUST respond quickly (< 30 seconds)
3. Webhook MUST be idempotent (handle duplicate calls)
4. User creation happens ONLY in webhook (not in checkout)

---

## Security Considerations

### API Authentication

```javascript
// Middleware for API routes
import { verifyApiKey } from "@/lib/apiAuth";

export async function middleware(request) {
  const apiKey = request.headers.get("x-api-key");

  if (!verifyApiKey(apiKey)) {
    return new Response("Unauthorized", { status: 401 });
  }
}
```

### MikroTik API Security

1. **Use dedicated API user** (not admin)

   ```routeros
   /user add name=apiuser group=write password=strong-password
   ```

2. **Restrict API access to VPN only**

   ```routeros
   /ip service set api-ssl address=10.99.0.0/24
   ```

3. **Use HTTPS (port 8729)** - Never plain HTTP (port 8728)

4. **Rotate API passwords regularly**

### Database Security

1. **Use MongoDB Atlas** with IP whitelist
2. **Enable authentication** (username/password)
3. **Use connection string secrets** in environment variables
4. **Encrypt sensitive fields** (passwords, API keys)

### Environment Variables

```bash
# .env.local (Never commit to git!)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
CLICKPESA_API_KEY=your_api_key_here
MIKROTIK_HOST=139.84.241.180
MIKROTIK_PORT=8729
MIKROTIK_USER=apiuser
MIKROTIK_PASS=your_password_here
NEXT_PUBLIC_BASE_URL=https://rpt-phi.vercel.app
```

---

## Troubleshooting Guide

### Issue: User paid but can't connect

**Possible causes:**

1. Webhook didn't create user (check logs)
2. Password doesn't match MAC
3. User is disabled
4. IP binding type is wrong

**Debug steps:**

```bash
# Check if user exists
/ip hotspot user print where name="AA:BB:CC:DD:EE:FF"

# Check user details
/ip hotspot user print detail where name="AA:BB:CC:DD:EE:FF"

# Expected output:
# name=AA:BB:CC:DD:EE:FF
# password=AA:BB:CC:DD:EE:FF
# mac-address=AA:BB:CC:DD:EE:FF
# disabled=no
# address="" (empty!)
```

### Issue: Auto-login fails

**Possible causes:**

1. login-auth.html not uploaded to router
2. Password field empty or wrong
3. Form action URL incorrect

**Debug steps:**

```routeros
# Check files
/file print where name~"login"

# Re-upload login-auth.html if missing
/file print file-name=login-auth.html
```

### Issue: Payment webhook not received

**Possible causes:**

1. Callback URL incorrect
2. ClickPesa can't reach Vercel (DNS issue)
3. Webhook endpoint returns error

**Debug steps:**

```bash
# Check webhook logs in Vercel dashboard
# Verify callback URL in ClickPesa dashboard
# Test webhook manually:
curl -X POST https://rpt-phi.vercel.app/api/v1/webhooks/clickpesa \
  -H "Content-Type: application/json" \
  -d '{"order_reference":"TEST","status":"SUCCESS"}'
```

---

## Appendix: Key Learnings Summary

### ✅ DO:

- Set `use-radius=no` in hotspot profile
- Set `password = MAC address` when creating users
- Leave `address=""` to allow DHCP
- Delete existing user before creating new one
- Handle webhook idempotency
- Use VPN for API access
- Test payment flow end-to-end before going live

### ❌ DON'T:

- Don't use FreeRADIUS unless you have stable network
- Don't use `!empty` in MongoDB queries
- Don't create users without password parameter
- Don't use `type=bypassed` in IP bindings
- Don't set static IP addresses in user records
- Don't expose MikroTik API directly to internet
- Don't hardcode secrets in code

---

**Document End**

For additional technical support:

- MikroTik REST API: https://help.mikrotik.com/docs/display/ROS/REST+API
- ClickPesa API Docs: https://developer.clickpesa.com/
- Next.js API Routes: https://nextjs.org/docs/api-routes/introduction
- MongoDB Queries: https://www.mongodb.com/docs/manual/reference/operator/query/
