import { dbConnect } from "@/lib/dbConnect";
import { requireAdminSession } from "@/lib/apiAuth";
import { badRequest, json, notFound, unauthorized } from "@/lib/apiResponse";
import Partner from "@/models/Partner";
import HotspotLocation from "@/models/HotspotLocation";
import Transaction from "@/models/Transaction";
import ServicePackage from "@/models/ServicePackage";
import { parseDateRange } from "@/lib/validators/admin";

export async function GET(req) {
  const session = await requireAdminSession(req);
  if (!session) return unauthorized();

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const partnerId = (searchParams.get("partnerId") || "").trim();
  if (!partnerId) return badRequest("partnerId is required");

  const dr = parseDateRange(searchParams);
  if (!dr.ok) return badRequest(dr.error);
  const { startDate, endDate } = dr;

  const partner = await Partner.findById(partnerId).lean();
  if (!partner) return notFound("Partner not found");

  // Find locations assigned to this partner
  const locations = await HotspotLocation.find({ partnerId })
    .select("_id name")
    .lean();
  const locationIds = locations.map((l) => l._id);

  let transactions = [];
  if (locationIds.length > 0) {
    transactions = await Transaction.find({
      status: "Completed",
      hotspotLocationId: { $in: locationIds },
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .sort({ createdAt: 1 })
      .populate({ path: "hotspotLocationId", select: "name" })
      .populate({ path: "servicePackageId", select: "name" })
      .lean();
  }

  const totalRevenueGenerated = transactions.reduce(
    (sum, t) => sum + (t.amount || 0),
    0
  );
  const revenueSharePercentage = partner.revenueSharePercentage || 0;
  const partnerPayoutAmount = Math.round(
    (totalRevenueGenerated * revenueSharePercentage) / 100
  );
  const operatorShareAmount = totalRevenueGenerated - partnerPayoutAmount;

  const txRows = transactions.map((t) => ({
    id: String(t._id),
    timestamp: t.createdAt.toISOString(),
    locationName: t.hotspotLocationId?.name || "-",
    packageName: t.servicePackageId?.name || "-",
    amount: t.amount || 0,
  }));

  return json({
    reportMetadata: {
      partnerName: `${partner.firstName || ""} ${
        partner.lastName || ""
      }`.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalRevenueGenerated,
      revenueSharePercentage,
      partnerPayoutAmount,
      operatorShareAmount,
    },
    transactions: txRows,
  });
}
