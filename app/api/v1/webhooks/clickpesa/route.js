import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { clickpesaChecksum } from "@/lib/utils";

export async function POST(req) {
  // Parse payload
  const payload = await req.json().catch(() => null);
  if (!payload) return new Response("Invalid JSON", { status: 400 });

  // Verify checksum if provided (ClickPesa may provide in header or body depending on config)
  const secret = process.env.CLICKPESA_CHECKSUM_KEY || "";
  if (secret) {
    const provided =
      payload.checksum || req.headers.get("x-clickpesa-checksum") || "";
    // Exclude checksum field when computing signature
    const { checksum, ...toSign } = payload || {};
    const computed = clickpesaChecksum(secret, toSign);
    if (!provided || provided !== computed) {
      return new Response("Invalid checksum", { status: 400 });
    }
  }

  const event = payload.event || payload.eventType || "";
  const data = payload.data || {};
  const orderReference = data.orderReference || payload.orderReference;
  if (!orderReference)
    return new Response("Missing orderReference", { status: 400 });

  await dbConnect();
  const tx = await Transaction.findOne({ orderReference });
  if (!tx) return new Response("ok", { status: 200 }); // no-op

  // Map outcomes
  if (
    event.includes("PAYMENT RECEIVED") ||
    data.status === "SUCCESS" ||
    data.status === "SETTLED"
  ) {
    tx.status = "Completed";
    tx.paymentReference =
      data.paymentReference || data.id || tx.paymentReference;
    tx.clickPesaTransactionId =
      data.paymentId || data.id || tx.clickPesaTransactionId;
  } else if (event.includes("PAYMENT FAILED") || data.status === "FAILED") {
    tx.status = "Failed";
  }
  tx.webhookPayload = payload;
  await tx.save();

  return new Response("ok", { status: 200 });
}
