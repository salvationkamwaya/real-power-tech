import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { badRequest, json, notFound, unauthorized } from "@/lib/apiResponse";
import HotspotLocation from "@/models/HotspotLocation";
import Partner from "@/models/Partner";
import { LocationUpdateSchema } from "@/lib/validators/admin";

export async function PUT(req, ctx) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  const { locationId } = await ctx.params;
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = LocationUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);

  if (parsed.data.partnerId) {
    const ok = await Partner.exists({ _id: parsed.data.partnerId });
    if (!ok) return badRequest("Invalid partnerId");
  }

  const updated = await HotspotLocation.findByIdAndUpdate(
    locationId,
    parsed.data,
    {
      new: true,
    }
  ).populate({ path: "partnerId", select: "firstName lastName" });

  if (!updated) return notFound("Location not found");

  return json({
    id: String(updated._id),
    name: updated.name,
    routerIdentifier: updated.routerIdentifier,
    status: updated.status,
    partner: updated.partnerId
      ? {
          id: String(updated.partnerId._id),
          name: `${updated.partnerId.firstName} ${updated.partnerId.lastName}`,
        }
      : null,
  });
}

export async function DELETE(req, ctx) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  const { locationId } = await ctx.params;
  await dbConnect();
  const res = await HotspotLocation.findByIdAndDelete(locationId);
  if (!res) return notFound("Location not found");
  return new Response(null, { status: 204 });
}
