import mongoose from "mongoose";

const HotspotLocationSchema = new mongoose.Schema(
  {
    name: String,
    routerModel: String,
    routerIdentifier: { type: String, unique: true, required: true },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

// Indexes for admin filters and lookups
HotspotLocationSchema.index({ partnerId: 1 });
HotspotLocationSchema.index({ name: 1 });

export default mongoose.models.HotspotLocation ||
  mongoose.model("HotspotLocation", HotspotLocationSchema);
