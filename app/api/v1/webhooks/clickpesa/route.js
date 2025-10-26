import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { clickpesaChecksum } from "@/lib/utils";
import ServicePackage from "@/models/ServicePackage";
import RadiusReply from "@/models/RadiusReply";
import RadiusAuth from "@/models/RadiusAuth";
import { normalizeMac } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

const limit = rateLimit({ windowMs: 10_000, max: 8 }); // 8 events per 10s per key

export async function POST(req) {
  // Parse payload
  const payload = await req.json().catch(() => null);
  if (!payload) return new Response("Invalid JSON", { status: 400 });

  const event = payload.event || payload.eventType || "";
  const data = payload.data || {};
  const orderReference = data.orderReference || payload.orderReference;

  // Basic rate limiting (per orderRef or IP)
  const ipHeader = req.headers.get("x-forwarded-for") || "";
  const ip =
    ipHeader.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const key = `webhook:${orderReference || ip}`;
  const { limited } = limit(key);
  if (limited) return new Response("Too Many Requests", { status: 429 });

  // Verify checksum if provided (ClickPesa may provide in header or body depending on config)
  const secret = process.env.CLICKPESA_CHECKSUM_KEY || "";
  if (secret) {
    const provided =
      payload.checksum || req.headers.get("x-clickpesa-checksum") || "";
    // Exclude checksum field when computing signature
    const { checksum, ...toSign } = payload || {};
    const computed = clickpesaChecksum(secret, toSign);
    if (!provided || provided !== computed) {
      return new Response("Invalid checksum", { status: 401 });
    }
  }

  if (!orderReference)
    return new Response("Missing orderReference", { status: 400 });

  await dbConnect();
  const tx = await Transaction.findOne({ orderReference });
  if (!tx) return new Response("ok", { status: 200 }); // no-op

  // Idempotency: if already finalized, acknowledge
  const incomingSuccess =
    event.includes("PAYMENT RECEIVED") ||
    data.status === "SUCCESS" ||
    data.status === "SETTLED";
  const incomingFailed =
    event.includes("PAYMENT FAILED") || data.status === "FAILED";

  if (
    (tx.status === "Completed" && incomingSuccess) ||
    (tx.status === "Failed" && incomingFailed)
  ) {
    return new Response("ok", { status: 200 });
  }

  let transitionedToCompleted = false;

  if (incomingSuccess) {
    if (tx.status !== "Completed") transitionedToCompleted = true;
    tx.status = "Completed";
    tx.paymentReference =
      data.paymentReference || data.id || tx.paymentReference;
    tx.clickPesaTransactionId =
      data.paymentId || data.id || tx.clickPesaTransactionId;

    // RADIUS grant (feature-flagged) — only on first completion
    if (
      transitionedToCompleted &&
      process.env.RADIUS_WRITE_ENABLED === "true"
    ) {
      try {
        const pkg = await ServicePackage.findById(tx.servicePackageId).lean();
        if (pkg?.durationMinutes && tx.customerMacAddress) {
          const sessionSeconds = Math.max(1, Number(pkg.durationMinutes) * 60);
          const username = normalizeMac(tx.customerMacAddress);
          const expiresAt = new Date(Date.now() + sessionSeconds * 1000);

          // 1) radcheck: ensure Auth-Type := Accept exists for this MAC
          await RadiusAuth.updateOne(
            {
              username,
              attribute: { $in: ["Auth-Type", "Cleartext-Password"] },
            },
            {
              username,
              attribute: "Auth-Type",
              op: ":=",
              value: "Accept",
              hotspotLocationId: tx.hotspotLocationId || null,
              expiresAt,
              orderReference,
            },
            { upsert: true }
          );

          // 2) radreply: set Session-Timeout
          await RadiusReply.updateOne(
            { orderReference, attribute: "Session-Timeout" },
            {
              username,
              attribute: "Session-Timeout",
              op: ":=",
              value: String(sessionSeconds),
              hotspotLocationId: tx.hotspotLocationId || null,
              expiresAt,
              orderReference,
            },
            { upsert: true }
          );
        }
      } catch (e) {
        // Swallow errors to not break webhook ACK; rely on logs/monitoring later
        console.error("RADIUS grant failed", e);
      }
    }
  } else if (incomingFailed) {
    tx.status = "Failed";
  }

  tx.webhookPayload = payload;
  await tx.save();

  return new Response("ok", { status: 200 });
}
