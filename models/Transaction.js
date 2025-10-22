import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    customerMacAddress: String,
    hotspotLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotspotLocation",
    },
    servicePackageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePackage",
    },
    amount: Number,
    currency: { type: String, default: "TZS" },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    clickPesaTransactionId: String,
    // New fields for payment reconciliation
    orderReference: { type: String, index: true },
    paymentReference: String,
    webhookPayload: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
