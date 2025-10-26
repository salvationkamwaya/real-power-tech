import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    revenueSharePercentage: { type: Number, required: true },
  },
  { timestamps: true }
);

// Index partners for quick search and counting
PartnerSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.models.Partner ||
  mongoose.model("Partner", PartnerSchema);
