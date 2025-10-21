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

export default mongoose.models.Partner ||
  mongoose.model("Partner", PartnerSchema);
