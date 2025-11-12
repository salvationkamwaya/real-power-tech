import mongoose from "mongoose";

const HotspotSessionSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true }, // MAC address
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    hotspotLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotspotLocation",
      required: true,
    },

    // Session details
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },

    // Activation details
    activationMethod: {
      type: String,
      enum: ["mikrotik-api", "radius"],
      required: true,
    },
    mikrotikUserId: String, // MikroTik user ID (for API-based)

    // Status
    status: {
      type: String,
      enum: ["Active", "Expired", "Disconnected"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Index for active session queries
HotspotSessionSchema.index({ username: 1, status: 1 });
HotspotSessionSchema.index({ hotspotLocationId: 1, status: 1 });

// TTL index - MongoDB will auto-delete documents when expiresAt is reached
HotspotSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.HotspotSession ||
  mongoose.model("HotspotSession", HotspotSessionSchema);
