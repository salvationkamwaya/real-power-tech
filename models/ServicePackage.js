import mongoose from "mongoose";

const ServicePackageSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    durationMinutes: Number,
    isActive: { type: Boolean, default: true },
    // Optional: Mikrotik rate limit in format "upload/download" (e.g., "1M/5M")
    rateLimit: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for quick package admin listing and active filtering
ServicePackageSchema.index({ isActive: 1, createdAt: -1 });
ServicePackageSchema.index({ name: 1 });

export default mongoose.models.ServicePackage ||
  mongoose.model("ServicePackage", ServicePackageSchema);
