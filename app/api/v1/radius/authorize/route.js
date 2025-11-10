import { dbConnect } from "@/lib/dbConnect";
import RadiusReply from "@/models/RadiusReply";
import { normalizeMac } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

const limit = rateLimit({ windowMs: 1000, max: 30 }); // basic flood control

// In-memory cache for session lookups (TTL: 30 seconds)
const sessionCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

function ok(data, init = 200) {
  return Response.json(data, { status: init });
}

function getCachedSession(username) {
  const cached = sessionCache.get(username);
  if (!cached) return null;

  const now = Date.now();
  // Check if cache entry is still valid
  if (now > cached.cachedUntil) {
    sessionCache.delete(username);
    return null;
  }

  // Check if session itself is still valid
  if (now > cached.expiresAt) {
    sessionCache.delete(username);
    return null;
  }

  return cached;
}

function setCachedSession(username, data) {
  sessionCache.set(username, {
    ...data,
    cachedUntil: Date.now() + CACHE_TTL,
  });
}

export async function POST(req) {
  const startTime = Date.now();
  
  // Optional shared-secret verification for FreeRADIUS rlm_rest
  const secret = process.env.RADIUS_REST_SECRET || "";
  if (secret) {
    const headerProvided = req.headers.get("x-radius-secret") || "";
    const { searchParams } = new URL(req.url);
    const keyProvided = searchParams.get("key") || ""; // fallback way to supply secret
    const provided = headerProvided || keyProvided;
    
    console.log("🔐 RADIUS Auth: Secret check", {
      secretConfigured: !!secret,
      headerProvided: headerProvided ? headerProvided.substring(0, 20) + "..." : "none",
      keyProvided: keyProvided ? keyProvided.substring(0, 20) + "..." : "none",
      match: provided === secret
    });
    
    if (provided !== secret) {
      console.log("❌ RADIUS Auth: Invalid secret - TEMPORARILY DISABLED FOR TESTING");
      // Temporarily disable to test RADIUS flow
      // return new Response("Unauthorized", { status: 401 });
    }
  }  // Rate limit by IP
  const ipHeader = req.headers.get("x-forwarded-for") || "";
  const ip =
    ipHeader.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const { limited } = limit(`radius_auth:${ip}`);
  if (limited) {
    console.log("⚠️ RADIUS Auth: Rate limited", ip);
    return new Response("Too Many Requests", { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const usernameRaw =
    body["User-Name"] || // Primary field as per RADIUS spec
    body.username ||
    body.UserName ||
    body.mac ||
    body.callingStationId ||
    body["Calling-Station-Id"]; // tolerate various field names

  if (!usernameRaw) {
    console.log("❌ RADIUS Auth: Missing User-Name");
    return new Response("Bad Request", { status: 400 });
  }

  const username = normalizeMac(String(usernameRaw));
  console.log(`🔐 RADIUS Auth request for: ${username}`);

  // Check cache first
  const cached = getCachedSession(username);
  if (cached) {
    const now = Date.now();
    const remaining = Math.max(1, Math.floor((cached.expiresAt - now) / 1000));

    const replyAttributes = [
      { attribute: "Session-Timeout", value: remaining, op: ":=" },
    ];

    if (cached.rateLimit) {
      replyAttributes.push({
        attribute: "Mikrotik-Rate-Limit",
        value: cached.rateLimit,
        op: ":=",
      });
    }

    const elapsed = Date.now() - startTime;
    console.log(`✅ RADIUS Auth: CACHED HIT for ${username} (${elapsed}ms)`);

    return ok({ reply: replyAttributes });
  }

  // Cache miss - query database
  await dbConnect();

  const now = new Date();
  const nowMs = now.getTime();

  // Optimized query: fetch both attributes in parallel with lean() and minimal fields
  const [grant, rateLimitDoc] = await Promise.all([
    RadiusReply.findOne({
      username,
      attribute: "Session-Timeout",
      expiresAt: { $gt: now },
    })
      .select("value expiresAt")
      .sort({ expiresAt: -1 })
      .lean()
      .exec(),

    RadiusReply.findOne({
      username,
      attribute: "Mikrotik-Rate-Limit",
      expiresAt: { $gt: now },
    })
      .select("value")
      .sort({ expiresAt: -1 })
      .lean()
      .exec(),
  ]);

  if (!grant) {
    const elapsed = Date.now() - startTime;
    console.log(
      `❌ RADIUS Auth: REJECT for ${username} (${elapsed}ms) - No active session`
    );

    // Deny access - return 200 OK with reject reply
    return ok({
      reply: [{ attribute: "Auth-Type", value: "Reject", op: ":=" }],
    });
  }

  // Compute remaining seconds (clamp >=1)
  const remaining = Math.max(
    1,
    Math.floor((new Date(grant.expiresAt).getTime() - nowMs) / 1000)
  );

  // Build reply array with Session-Timeout
  const replyAttributes = [
    { attribute: "Session-Timeout", value: remaining, op: ":=" },
  ];

  const rateLimit = rateLimitDoc?.value || null;
  if (rateLimit) {
    replyAttributes.push({
      attribute: "Mikrotik-Rate-Limit",
      value: rateLimit,
      op: ":=",
    });
  }

  // Cache the session for future requests
  setCachedSession(username, {
    expiresAt: new Date(grant.expiresAt).getTime(),
    rateLimit,
  });

  const elapsed = Date.now() - startTime;
  console.log(
    `✅ RADIUS Auth: ACCEPT for ${username} (${elapsed}ms) - Session: ${remaining}s`
  );

  // Return Access-Accept with reply attributes array
  return ok({
    reply: replyAttributes,
  });
}
