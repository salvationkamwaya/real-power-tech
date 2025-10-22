import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import { json, notFound } from "@/lib/apiResponse";
import { queryPaymentStatus } from "@/lib/clickpesa";

export async function GET(req, ctx) {
  const { orderReference } = await ctx.params;
  await dbConnect();
  const tx = await Transaction.findOne({ orderReference });
  if (!tx) return notFound("Transaction not found");

  if (tx.status === "Pending") {
    try {
      const res = await queryPaymentStatus(orderReference);
      const latest = Array.isArray(res) ? res[0] : res;
      if (latest?.status === "SUCCESS" || latest?.status === "SETTLED") {
        tx.status = "Completed";
        await tx.save();
      } else if (latest?.status === "FAILED") {
        tx.status = "Failed";
        await tx.save();
      }
    } catch (_) {}
  }

  return json({ orderReference, status: tx.status });
}
