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

// Helpful indexes for dashboards and reports
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ hotspotLocationId: 1, createdAt: -1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
