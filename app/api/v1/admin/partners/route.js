import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { badRequest, json, unauthorized } from "@/lib/apiResponse";
import Partner from "@/models/Partner";
import HotspotLocation from "@/models/HotspotLocation";
import { PartnerCreateSchema, parsePagination } from "@/lib/validators/admin";

export async function GET(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const { page, limit, search } = parsePagination(searchParams);

  const filter = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const totalItems = await Partner.countDocuments(filter);
  const partners = await Partner.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const ids = partners.map((p) => p._id);
  const counts = await HotspotLocation.aggregate([
    { $match: { partnerId: { $in: ids } } },
    { $group: { _id: "$partnerId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

  const data = partners.map((p) => ({
    id: String(p._id),
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    revenueSharePercentage: p.revenueSharePercentage,
    assignedLocationsCount: countMap.get(String(p._id)) || 0,
  }));

  return json({
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit) || 1,
      totalItems,
    },
    data,
  });
}

export async function POST(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = PartnerCreateSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.flatten().fieldErrors);
  }
  const p = await Partner.create(parsed.data);
  return json(
    {
      id: String(p._id),
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      revenueSharePercentage: p.revenueSharePercentage,
      assignedLocationsCount: 0,
    },
    201
  );
}
