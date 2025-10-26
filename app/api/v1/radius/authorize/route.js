import { dbConnect } from "@/lib/dbConnect";
import RadiusReply from "@/models/RadiusReply";
import { normalizeMac } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

const limit = rateLimit({ windowMs: 1000, max: 30 }); // basic flood control

function ok(data, init = 200) {
  return Response.json(data, { status: init });
}

export async function POST(req) {
  // Optional shared-secret verification for FreeRADIUS rlm_rest
  const secret = process.env.RADIUS_REST_SECRET || "";
  if (secret) {
    const headerProvided = req.headers.get("x-radius-secret") || "";
    const { searchParams } = new URL(req.url);
    const keyProvided = searchParams.get("key") || ""; // fallback way to supply secret
    const provided = headerProvided || keyProvided;
    if (provided !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // Rate limit by IP
  const ipHeader = req.headers.get("x-forwarded-for") || "";
  const ip =
    ipHeader.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const { limited } = limit(`radius_auth:${ip}`);
  if (limited) return new Response("Too Many Requests", { status: 429 });

  const body = await req.json().catch(() => ({}));
  const usernameRaw =
    body["User-Name"] || // Primary field as per RADIUS spec
    body.username ||
    body.UserName ||
    body.mac ||
    body.callingStationId ||
    body["Calling-Station-Id"]; // tolerate various field names
  if (!usernameRaw) return new Response("Bad Request", { status: 400 });
  const username = normalizeMac(String(usernameRaw));

  await dbConnect();

  // Find an active grant in radreply (Session-Timeout) that hasn't expired
  const now = new Date();
  const grant = await RadiusReply.findOne({
    username,
    attribute: "Session-Timeout",
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: -1 })
    .lean();

  if (!grant) {
    // Deny access - return 200 OK with reject reply
    return ok({
      reply: [{ attribute: "Auth-Type", value: "Reject", op: ":=" }],
    });
  }

  // Compute remaining seconds (clamp >=1)
  const remaining = Math.max(
    1,
    Math.floor((new Date(grant.expiresAt).getTime() - now.getTime()) / 1000)
  );

  // Build reply array with Session-Timeout
  const replyAttributes = [
    { attribute: "Session-Timeout", value: remaining, op: ":=" },
  ];

  // Check if there's a Mikrotik-Rate-Limit configured for this user
  const rateLimit = await RadiusReply.findOne({
    username,
    attribute: "Mikrotik-Rate-Limit",
    expiresAt: { $gt: now },
  })
    .sort({ expiresAt: -1 })
    .lean();

  if (rateLimit?.value) {
    replyAttributes.push({
      attribute: "Mikrotik-Rate-Limit",
      value: rateLimit.value,
      op: ":=",
    });
  }

  // Return Access-Accept with reply attributes array
  return ok({
    reply: replyAttributes,
  });
}
