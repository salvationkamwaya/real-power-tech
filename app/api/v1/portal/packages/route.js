import { dbConnect } from "@/lib/dbConnect";
import ServicePackage from "@/models/ServicePackage";
import { json } from "@/lib/apiResponse";

export async function GET() {
  await dbConnect();
  const docs = await ServicePackage.find({ isActive: true }).sort({
    createdAt: -1,
  });
  return json(
    docs.map((p) => ({
      id: String(p._id),
      name: p.name,
      price: p.price,
      durationMinutes: p.durationMinutes,
      isActive: p.isActive,
    }))
  );
}
