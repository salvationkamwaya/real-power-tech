import { dbConnect } from "@/lib/dbConnect";
import { badRequest, json } from "@/lib/apiResponse";
import ServicePackage from "@/models/ServicePackage";
import Transaction from "@/models/Transaction";
import { createCheckoutLink } from "@/lib/clickpesa";

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
    customerName,
    customerEmail,
    customerPhone,
  } = body || {};
  if (!packageId) return badRequest("packageId is required");

  const pkg = await ServicePackage.findById(packageId);
  if (!pkg || !pkg.isActive) return badRequest("Invalid or inactive packageId");

  const orderReference = newOrderReference();
  await Transaction.create({
    servicePackageId: pkg._id,
    hotspotLocationId: locationId || null,
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
