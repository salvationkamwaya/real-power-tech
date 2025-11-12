import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";
import ServicePackage from "@/models/ServicePackage";
import HotspotLocation from "@/models/HotspotLocation";
import HotspotSession from "@/models/HotspotSession";
import { activateHotspotUser } from "@/lib/mikrotik";
import { normalizeMac } from "@/lib/utils";
import { json, badRequest, notFound } from "@/lib/apiResponse";

/**
 * POST /api/v1/portal/activate-session
 *
 * Manual activation endpoint for users to retry activation from success page
 * If webhook failed to activate, user can click retry button
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { orderReference } = body;

    if (!orderReference) {
      return badRequest("Order reference is required");
    }

    // Find the transaction
    const tx = await Transaction.findOne({ orderReference });
    if (!tx) {
      return notFound("Transaction not found");
    }

    // Check if payment was successful
    if (tx.status !== "Completed") {
      return badRequest("Payment not completed");
    }

    // If already activated, return success
    if (tx.activationStatus === "Activated") {
      return json({
        message: "Already activated",
        activationStatus: "Activated",
        activatedAt: tx.activatedAt,
      });
    }

    // Attempt MikroTik activation
    console.log("🔄 Manual activation retry for order:", orderReference);

    const pkg = await ServicePackage.findById(tx.servicePackageId).lean();
    const location = await HotspotLocation.findById(
      tx.hotspotLocationId
    ).lean();

    if (!pkg) {
      tx.activationStatus = "Failed";
      tx.activationError = "Package not found";
      await tx.save();
      return notFound("Package not found");
    }

    if (!pkg.durationMinutes) {
      tx.activationStatus = "Failed";
      tx.activationError = "Package missing duration";
      await tx.save();
      return json({ error: "Package configuration error" }, 500);
    }

    if (!tx.customerMacAddress) {
      tx.activationStatus = "Failed";
      tx.activationError = "MAC address missing";
      await tx.save();
      return badRequest("MAC address not found in transaction");
    }

    if (!location) {
      tx.activationStatus = "Failed";
      tx.activationError = "Location not found";
      await tx.save();
      return notFound("Hotspot location not found");
    }

    if (
      !location.routerApiUrl ||
      !location.routerApiUsername ||
      !location.routerApiPassword
    ) {
      tx.activationStatus = "Failed";
      tx.activationError = "Router API credentials not configured";
      await tx.save();
      return json({ error: "Router not configured for API access" }, 500);
    }

    const sessionSeconds = Math.max(1, Number(pkg.durationMinutes) * 60);
    const username = normalizeMac(tx.customerMacAddress);
    const expiresAt = new Date(Date.now() + sessionSeconds * 1000);

    console.log("📝 Retrying MikroTik activation:", {
      username,
      sessionSeconds,
      packageName: pkg.name,
      expiresAt: expiresAt.toISOString(),
    });

    // Activate user on MikroTik router via REST API
    const activationResult = await activateHotspotUser({
      routerUrl: location.routerApiUrl,
      username: location.routerApiUsername,
      password: location.routerApiPassword,
      macAddress: username,
      durationSeconds: sessionSeconds,
      profile: pkg.mikrotikProfile || "default",
      rateLimit: pkg.rateLimit || null,
    });

    if (activationResult.success) {
      console.log("✅ Manual activation successful:", activationResult.userId);

      // Update transaction with activation details
      tx.activationStatus = "Retried"; // Mark as retried to distinguish from webhook activation
      tx.activationMethod = "mikrotik-api";
      tx.activatedAt = new Date();
      tx.mikrotikUserId = activationResult.userId;
      await tx.save();

      // Create session tracking record (MongoDB will auto-cleanup via TTL)
      await HotspotSession.create({
        username,
        transactionId: tx._id,
        hotspotLocationId: tx.hotspotLocationId,
        startedAt: new Date(),
        expiresAt,
        activationMethod: "mikrotik-api",
        mikrotikUserId: activationResult.userId,
        status: "Active",
      });

      console.log("✅ Manual activation completed successfully");

      return json({
        message: "Activation successful",
        activationStatus: "Retried",
        activatedAt: tx.activatedAt,
      });
    } else {
      console.error("❌ Manual activation failed:", activationResult.error);

      tx.activationStatus = "Failed";
      tx.activationError = activationResult.error;
      await tx.save();

      return json(
        { error: `Activation failed: ${activationResult.error}` },
        500
      );
    }
  } catch (error) {
    console.error("❌ Manual activation exception:", error);
    return json({ error: error.message }, 500);
  }
}
