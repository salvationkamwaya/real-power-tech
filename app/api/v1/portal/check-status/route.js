import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";

/**
 * GET /api/v1/portal/check-status?order=RPT...
 * Check activation status of a transaction
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderReference = searchParams.get("order");

    if (!orderReference) {
      return NextResponse.json(
        { error: "Missing order reference" },
        { status: 400 }
      );
    }

    await dbConnect();

    const transaction = await Transaction.findOne({ orderReference })
      .select("activationStatus activationError customerMacAddress status")
      .lean();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      activationStatus: transaction.activationStatus || "Pending",
      activationError: transaction.activationError || null,
      macAddress: transaction.customerMacAddress || null,
      paymentStatus: transaction.status || "Pending",
    });
  } catch (error) {
    console.error("❌ Check status error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
