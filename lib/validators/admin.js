import { z } from "zod";

export const PartnerCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  revenueSharePercentage: z.number().min(0).max(100),
});
export const PartnerUpdateSchema = PartnerCreateSchema.partial();

export const macRegex = /^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$/;

export const LocationCreateSchema = z.object({
  name: z.string().min(1),
  routerModel: z.string().optional().or(z.literal("")),
  routerIdentifier: z.string().regex(macRegex, "Invalid MAC address format"),
  partnerId: z.string().min(1),
  // MikroTik API Configuration
  activationMethod: z.enum(["mikrotik-api", "radius", "auto"]).optional(),
  routerApiUrl: z.string().url().optional().or(z.literal("")),
  routerApiUsername: z.string().optional().or(z.literal("")),
  routerApiPassword: z.string().optional().or(z.literal("")),
});
export const LocationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  partnerId: z.string().min(1).optional(),
});

export const PackageCreateSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
  durationMinutes: z.number().int().positive(),
});
export const PackageUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  durationMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export function parsePagination(searchParams) {
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") || 20))
  );
  const search = (searchParams.get("search") || "").trim();
  return { page, limit, search };
}

// New: safe date range parsing for reports
export function parseDateRange(searchParams) {
  const start = searchParams.get("startDate");
  const end = searchParams.get("endDate");
  if (!start || !end)
    return { ok: false, error: "startDate and endDate are required" };
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      ok: false,
      error: "Invalid date format. Use ISO 8601 (e.g., 2025-10-01).",
    };
  }
  if (startDate > endDate) {
    return { ok: false, error: "startDate must be before or equal to endDate" };
  }
  return { ok: true, startDate, endDate };
}
