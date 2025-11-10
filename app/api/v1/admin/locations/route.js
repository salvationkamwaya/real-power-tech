import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { badRequest, conflict, json, unauthorized } from "@/lib/apiResponse";
import HotspotLocation from "@/models/HotspotLocation";
import Partner from "@/models/Partner";
import { LocationCreateSchema, parsePagination } from "@/lib/validators/admin";
import { normalizeMac } from "@/lib/utils";

export async function GET(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const { page, limit, search } = parsePagination(searchParams);

  const filter = search ? { name: { $regex: search, $options: "i" } } : {};
  const totalItems = await HotspotLocation.countDocuments(filter);
  const rows = await HotspotLocation.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({ path: "partnerId", select: "firstName lastName" })
    .lean();

  const data = rows.map((l) => ({
    id: String(l._id),
    name: l.name,
    routerIdentifier: l.routerIdentifier,
    status: l.status,
    partner: l.partnerId
      ? {
          id: String(l.partnerId._id),
          name: `${l.partnerId.firstName} ${l.partnerId.lastName}`,
        }
      : null,
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
  const parsed = LocationCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);

  const { partnerId, routerIdentifier } = parsed.data;
  
  // Normalize the router MAC address
  const normalizedRouterMac = normalizeMac(routerIdentifier);
  
  const partner = await Partner.findById(partnerId);
  if (!partner) return badRequest("Invalid partnerId");

  const exists = await HotspotLocation.findOne({
    routerIdentifier: normalizedRouterMac,
  });
  if (exists) return conflict("Router MAC already registered");

  const created = await HotspotLocation.create({
    name: parsed.data.name,
    routerModel: parsed.data.routerModel,
    routerIdentifier: normalizedRouterMac,
    partnerId,
  });

  return json(
    {
      id: String(created._id),
      name: created.name,
      routerIdentifier: created.routerIdentifier,
      status: created.status,
      partner: {
        id: String(partner._id),
        name: `${partner.firstName} ${partner.lastName}`,
      },
    },
    201
  );
}
