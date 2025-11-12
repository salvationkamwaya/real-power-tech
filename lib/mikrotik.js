import HotspotLocation from "@/models/HotspotLocation";
import { decryptPassword } from "./encryption";

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
 * Call MikroTik REST API
 */
async function callMikrotikAPI(
  location,
  endpoint,
  method = "GET",
  body = null
) {
  const { routerApiUrl, routerApiUsername, routerApiPassword } = location;

  if (!routerApiUrl || !routerApiUsername || !routerApiPassword) {
    throw new Error("Router API credentials not configured");
  }

  // Decrypt password
  const password = decryptPassword(routerApiPassword);
  if (!password) {
    throw new Error("Failed to decrypt router password");
  }

  const url = `${routerApiUrl}${endpoint}`;
  const auth = Buffer.from(`${routerApiUsername}:${password}`).toString(
    "base64"
  );

  const options = {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  console.log(`🔌 MikroTik API call: ${method} ${endpoint}`);

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MikroTik API error: ${response.status} - ${error}`);
  }

  return await response.json();
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
  try {
    const location = await HotspotLocation.findById(locationId);

    if (!location) {
      throw new Error("Location not found");
    }

    const duration = formatMikrotikDuration(sessionSeconds);

    // Create hotspot user via REST API
    const userData = {
      name: mac,
      "mac-address": mac,
      "limit-uptime": duration,
      profile: "default",
      comment: `Order: ${orderReference}`,
    };

    // Add rate limit if specified
    if (rateLimit) {
      userData["limit-bytes-total"] = rateLimit;
    }

    console.log(`✨ Creating MikroTik user:`, {
      mac,
      duration,
      orderReference,
    });

    const result = await callMikrotikAPI(
      location,
      "/rest/ip/hotspot/user/add",
      "POST",
      userData
    );

    const userId = result[".id"] || result["*id"];
    console.log(`✅ MikroTik user created successfully:`, userId);

    return {
      success: true,
      mikrotikUserId: userId,
      message: "User activated successfully",
    };
  } catch (error) {
    console.error("❌ MikroTik activation error:", error);
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
  try {
    const location = await HotspotLocation.findById(locationId);

    if (!location) {
      throw new Error("Location not found");
    }

    console.log(`🔌 Disconnecting user from MikroTik:`, mac);

    // Remove from active sessions
    const activeUsers = await callMikrotikAPI(
      location,
      `/rest/ip/hotspot/active?mac-address=${mac}`,
      "GET"
    );

    if (activeUsers && activeUsers.length > 0) {
      for (const user of activeUsers) {
        await callMikrotikAPI(
          location,
          `/rest/ip/hotspot/active/${user[".id"]}`,
          "DELETE"
        );
        console.log(`✅ Removed active session:`, user[".id"]);
      }
    }

    // Remove user entry
    const users = await callMikrotikAPI(
      location,
      `/rest/ip/hotspot/user?name=${mac}`,
      "GET"
    );

    if (users && users.length > 0) {
      for (const user of users) {
        await callMikrotikAPI(
          location,
          `/rest/ip/hotspot/user/${user[".id"]}`,
          "DELETE"
        );
        console.log(`✅ Removed user entry:`, user[".id"]);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("❌ MikroTik disconnect error:", error);
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
  try {
    const location = await HotspotLocation.findById(locationId);

    if (!location) {
      throw new Error("Location not found");
    }

    const active = await callMikrotikAPI(
      location,
      `/rest/ip/hotspot/active?mac-address=${mac}`,
      "GET"
    );

    if (active && active.length > 0) {
      return {
        isActive: true,
        session: active[0],
      };
    }

    return { isActive: false };
  } catch (error) {
    console.error("❌ MikroTik session check error:", error);
    return { isActive: false, error: error.message };
  }
}
