import mongoose from "mongoose";

const ServicePackageSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    durationMinutes: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ServicePackage ||
  mongoose.model("ServicePackage", ServicePackageSchema);
