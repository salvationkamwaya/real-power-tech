import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { badRequest, json, notFound, unauthorized } from "@/lib/apiResponse";
import ServicePackage from "@/models/ServicePackage";
import { PackageUpdateSchema } from "@/lib/validators/admin";

export async function PUT(req, { params }) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = PackageUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);
  const { packageId } = await params;
  const updated = await ServicePackage.findByIdAndUpdate(
    packageId,
    parsed.data,
    { new: true }
  );
  if (!updated) return notFound("Package not found");
  return json({
    id: String(updated._id),
    name: updated.name,
    price: updated.price,
    durationMinutes: updated.durationMinutes,
    isActive: updated.isActive,
  });
}
