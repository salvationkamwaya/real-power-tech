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
