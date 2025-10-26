import { dbConnect } from "@/lib/dbConnect";
import { badRequest, json, notFound } from "@/lib/apiResponse";
import ServicePackage from "@/models/ServicePackage";
import Transaction from "@/models/Transaction";
import { createCheckoutLink } from "@/lib/clickpesa";
import HotspotLocation from "@/models/HotspotLocation";
import { macRegex } from "@/lib/validators/admin";

function newOrderReference() {
  const ts = Date.now().toString();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RPT${ts}${rnd}`; // strictly alphanumeric
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const {
    packageId,
    locationId,
    customerMacAddress,
    routerIdentifier,
    customerName,
    customerEmail,
    customerPhone,
  } = body || {};
  if (!packageId) return badRequest("packageId is required");

  // Validate MACs if provided
  if (customerMacAddress && !macRegex.test(customerMacAddress)) {
    return badRequest("Invalid customerMacAddress (MAC) format");
  }
  if (routerIdentifier && !macRegex.test(routerIdentifier)) {
    return badRequest("Invalid routerIdentifier (MAC) format");
  }

  const pkg = await ServicePackage.findById(packageId);
  if (!pkg || !pkg.isActive) return badRequest("Invalid or inactive packageId");

  // Resolve hotspot location by routerIdentifier if provided
  let hotspotLocationId = null;
  if (routerIdentifier) {
    const loc = await HotspotLocation.findOne({ routerIdentifier }).select(
      "_id"
    );
    if (!loc) return notFound("Hotspot location not registered");
    hotspotLocationId = loc._id;
  } else if (locationId) {
    hotspotLocationId = locationId; // fallback path if portal passes locationId
  }

  const orderReference = newOrderReference();
  await Transaction.create({
    servicePackageId: pkg._id,
    hotspotLocationId: hotspotLocationId || null,
    customerMacAddress: customerMacAddress || null,
    amount: pkg.price,
    currency: process.env.CLICKPESA_CURRENCY || "TZS",
    orderReference,
    status: "Pending",
  });

  const description = `WiFi package: ${pkg.name}`;
  try {
    const { checkoutLink } = await createCheckoutLink({
      totalPrice: String(pkg.price),
      orderReference,
      orderCurrency: process.env.CLICKPESA_CURRENCY || "TZS",
      customerName,
      customerEmail,
      customerPhone,
      description,
    });
    return json({ orderReference, paymentUrl: checkoutLink });
  } catch (e) {
    return badRequest(
      "Hosted Checkout not enabled for this application. Enable Hosted Checkout in ClickPesa Dashboard (Settings → Developers → Hosted Application) or use a Hosted Application's Client ID/API Key."
    );
  }
}
