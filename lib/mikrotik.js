import HotspotLocation from "@/models/HotspotLocation";
import { decryptPassword } from "./encryption";
import { RouterOSAPI } from "node-routeros";

/**
 * Format duration for MikroTik uptime limit
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted as "HH:MM:SS"
 */
function formatMikrotikDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

/**
 * Create and connect to MikroTik router using Binary API
 */
async function connectToRouter(location) {
  const { routerApiUrl, routerApiUsername, routerApiPassword } = location;

  if (!routerApiUrl || !routerApiUsername || !routerApiPassword) {
    throw new Error("Router API credentials not configured");
  }

  // Decrypt password
  const password = decryptPassword(routerApiPassword);
  if (!password) {
    throw new Error("Failed to decrypt router password");
  }

  // Extract host and port from URL (e.g., "https://192.168.0.181:8729")
  const url = new URL(routerApiUrl);
  const host = url.hostname;
  const port = parseInt(url.port) || 8729; // Default to 8729 for api-ssl

  console.log(`🔌 Connecting to MikroTik: ${host}:${port}`);

  const api = new RouterOSAPI({
    host,
    user: routerApiUsername,
    password,
    port,
    timeout: 10,
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });

  await api.connect();
  console.log(`✅ Connected to MikroTik router`);

  return api;
}

/**
 * Activate user on MikroTik router
 * @param {Object} params - Activation parameters
 * @param {string} params.locationId - Location MongoDB ID
 * @param {string} params.mac - User MAC address
 * @param {number} params.sessionSeconds - Session duration in seconds
 * @param {string} params.rateLimit - Rate limit (e.g., "512k/512k")
 * @param {string} params.orderReference - Order reference for tracking
 * @returns {Promise<{success: boolean, mikrotikUserId?: string, error?: string}>}
 */
export async function activateHotspotUser({
  locationId,
  mac,
  sessionSeconds,
  rateLimit,
  orderReference,
}) {
  let api;
  try {
    const location = await HotspotLocation.findById(locationId);

    if (!location) {
      throw new Error("Location not found");
    }

    const duration = formatMikrotikDuration(sessionSeconds);

    console.log(`✨ Creating MikroTik user:`, {
      mac,
      duration,
      orderReference,
    });

    api = await connectToRouter(location);

    // Build command parameters - node-routeros format requires = prefix
    const params = [
      `=name=${mac}`,
      `=mac-address=${mac}`,
      `=limit-uptime=${duration}`,
      `=profile=default`,
      `=comment=Order: ${orderReference}`,
    ];

    // Add rate limit if specified
    if (rateLimit) {
      params.push(`=limit-bytes-total=${rateLimit}`);
    }

    // Execute command: /ip hotspot user add
    const result = await api.write("/ip/hotspot/user/add", params);

    const userId = result || "created";
    console.log(`✅ MikroTik user created successfully: ${userId}`);

    await api.close();

    return {
      success: true,
      mikrotikUserId: userId,
      message: "User activated successfully",
    };
  } catch (error) {
    console.error("❌ MikroTik activation error:", error);
    if (api) {
      try {
        await api.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Disconnect user from MikroTik router
 * @param {string} locationId - Location MongoDB ID
 * @param {string} mac - User MAC address
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function disconnectHotspotUser(locationId, mac) {
  let api;
  try {
    const location = await HotspotLocation.findById(locationId);

    if (!location) {
      throw new Error("Location not found");
    }

    console.log(`🔌 Disconnecting user from MikroTik:`, mac);

    api = await connectToRouter(location);

    // Find and remove active sessions
    const activeSessions = await api.write("/ip/hotspot/active/print", [
      "=.proplist=.id,mac-address",
    ]);

    if (activeSessions && activeSessions.length > 0) {
      for (const session of activeSessions) {
        if (session["mac-address"] === mac) {
          await api.write("/ip/hotspot/active/remove", [
            `=.id=${session[".id"]}`,
          ]);
          console.log(`✅ Removed active session:`, session[".id"]);
        }
      }
    }

    // Find and remove user entries
    const users = await api.write("/ip/hotspot/user/print", [
      "=.proplist=.id,name",
    ]);

    if (users && users.length > 0) {
      for (const user of users) {
        if (user.name === mac) {
          await api.write("/ip/hotspot/user/remove", [`=.id=${user[".id"]}`]);
          console.log(`✅ Removed user entry:`, user[".id"]);
        }
      }
    }

    await api.close();

    return { success: true };
  } catch (error) {
    console.error("❌ MikroTik disconnect error:", error);
    if (api) {
      try {
        await api.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    return { success: false, error: error.message };
  }
}

/**
 * Check if user is currently active
 * @param {string} locationId - Location MongoDB ID
 * @param {string} mac - User MAC address
 * @returns {Promise<{isActive: boolean, session?: object, error?: string}>}
 */
export async function getActiveSession(locationId, mac) {
  let api;
  try {
    const location = await HotspotLocation.findById(locationId);

    if (!location) {
      throw new Error("Location not found");
    }

    api = await connectToRouter(location);

    const active = await api.write("/ip/hotspot/active/print", [
      "=.proplist=.id,mac-address,uptime,bytes-in,bytes-out",
    ]);

    await api.close();

    if (active && active.length > 0) {
      for (const session of active) {
        if (session["mac-address"] === mac) {
          return {
            isActive: true,
            session,
          };
        }
      }
    }

    return { isActive: false };
  } catch (error) {
    console.error("❌ MikroTik session check error:", error);
    if (api) {
      try {
        await api.close();
      } catch (e) {
        // Ignore close errors
      }
    }
    return { isActive: false, error: error.message };
  }
}
