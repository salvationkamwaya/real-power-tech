import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import {
  badRequest,
  conflict,
  json,
  notFound,
  unauthorized,
} from "@/lib/apiResponse";
import Partner from "@/models/Partner";
import HotspotLocation from "@/models/HotspotLocation";
import { PartnerUpdateSchema } from "@/lib/validators/admin";

export async function PUT(req, { params }) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  const { partnerId } = await params;
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = PartnerUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);

  const p = await Partner.findByIdAndUpdate(partnerId, parsed.data, {
    new: true,
  });
  if (!p) return notFound("Partner not found");
  return json({
    id: String(p._id),
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    revenueSharePercentage: p.revenueSharePercentage,
    assignedLocationsCount: await HotspotLocation.countDocuments({
      partnerId: p._id,
    }),
  });
}

export async function DELETE(req, { params }) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  const { partnerId } = await params;
  await dbConnect();
  const count = await HotspotLocation.countDocuments({ partnerId });
  if (count > 0)
    return conflict(
      `Cannot delete partner. Re-assign their ${count} locations first.`
    );
  const res = await Partner.findByIdAndDelete(partnerId);
  if (!res) return notFound("Partner not found");
  return new Response(null, { status: 204 });
}
