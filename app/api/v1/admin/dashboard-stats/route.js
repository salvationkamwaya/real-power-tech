import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { json, unauthorized } from "@/lib/apiResponse";
import Transaction from "@/models/Transaction";
import HotspotLocation from "@/models/HotspotLocation";
import Partner from "@/models/Partner";
import ServicePackage from "@/models/ServicePackage";

export async function GET(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();
  await dbConnect();

  const [
    totalRevenueAgg,
    totalUsersConnected,
    activeLocations,
    activePartners,
  ] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Transaction.countDocuments({ status: "Completed" }),
    HotspotLocation.countDocuments({ status: "Active" }),
    Partner.countDocuments({}),
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  const recent = await Transaction.find({ status: "Completed" })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({ path: "hotspotLocationId", select: "name" })
    .populate({ path: "servicePackageId", select: "name" })
    .lean();

  const recentTransactions = recent.map((t) => ({
    id: String(t._id),
    locationName: t.hotspotLocationId?.name || "-",
    packageName: t.servicePackageId?.name || "-",
    amount: t.amount,
    timestamp: t.createdAt.toISOString(),
  }));

  return json({
    stats: {
      totalRevenue,
      totalUsersConnected,
      activeLocations,
      activePartners,
    },
    recentTransactions,
  });
}
