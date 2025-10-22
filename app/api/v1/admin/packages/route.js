import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { badRequest, json, unauthorized } from "@/lib/apiResponse";
import ServicePackage from "@/models/ServicePackage";
import { PackageCreateSchema } from "@/lib/validators/admin";

export async function GET(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();
  const list = await ServicePackage.find({}).sort({ createdAt: -1 }).lean();
  return json(
    list.map((p) => ({
      id: String(p._id),
      name: p.name,
      price: p.price,
      durationMinutes: p.durationMinutes,
      isActive: p.isActive,
    }))
  );
}

export async function POST(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = PackageCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.flatten().fieldErrors);
  const created = await ServicePackage.create(parsed.data);
  return json(
    {
      id: String(created._id),
      name: created.name,
      price: created.price,
      durationMinutes: created.durationMinutes,
      isActive: created.isActive,
    },
    201
  );
}
