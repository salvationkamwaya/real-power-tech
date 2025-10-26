import mongoose from "mongoose";

// radcheck collection for FreeRADIUS (rlm_mongodb). Each document represents an auth attribute.
// For session-based access we primarily need Session-Timeout.
// username: normalized MAC address used as User-Name
// attribute: e.g., 'Session-Timeout'
// op: usually ':='
// value: stringified value for the attribute (seconds)
// orderReference: to dedupe per transaction
// hotspotLocationId: traceability
// expiresAt: when this grant naturally expires (for cleanup jobs)

const RadiusAuthSchema = new mongoose.Schema(
  {
    username: { type: String, index: true },
    attribute: { type: String, required: true },
    op: { type: String, default: ":=" },
    value: { type: String, required: true },
    orderReference: { type: String, index: true },
    hotspotLocationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotspotLocation",
    },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true, collection: "radcheck" }
);

export default mongoose.models.RadiusAuth ||
  mongoose.model("RadiusAuth", RadiusAuthSchema);
