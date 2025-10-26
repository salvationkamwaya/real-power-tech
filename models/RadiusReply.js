import mongoose from "mongoose";

// radreply collection for FreeRADIUS (rlm_mongodb). Each document contains a reply attribute
// returned on Access-Accept, e.g., 'Session-Timeout' or 'Mikrotik-Rate-Limit'.
// username: normalized MAC address used as User-Name
// attribute: e.g., 'Session-Timeout'
// op: usually ':='
// value: stringified value for the attribute (seconds for Session-Timeout)
// orderReference: to dedupe per transaction
// hotspotLocationId: traceability
// expiresAt: when this grant naturally expires (TTL cleanup)

const RadiusReplySchema = new mongoose.Schema(
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
    // TTL index: expire document at expiresAt
    expiresAt: { type: Date, index: true, expires: 0 },
  },
  { timestamps: true, collection: "radreply" }
);

export default mongoose.models.RadiusReply ||
  mongoose.model("RadiusReply", RadiusReplySchema);
