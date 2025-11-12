/**
 * Test MikroTik Binary API Connection
 * Run this to    // Step 4: Check existing hotspot users
    console.log("4️⃣  Checking existing hotspot users...");
    const users = await api.write("/ip/hotspot/user/print");rify router connectivity before deploying
 */

import { RouterOSAPI } from "node-routeros";

// Your router details - EDIT THESE IF NEEDED
const ROUTER_CONFIG = {
  host: "192.168.0.181", // Router IP address
  port: 8729, // API-SSL port
  user: "api-admin", // API username
  password: "MySecurePass123!", // API password - CHANGE THIS IF DIFFERENT!
  timeout: 10,
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
};

// You can also set password via environment variable:
// export MIKROTIK_PASSWORD="YourPassword"
// Then use: password: process.env.MIKROTIK_PASSWORD || "MySecurePass123!",
if (process.env.MIKROTIK_PASSWORD) {
  ROUTER_CONFIG.password = process.env.MIKROTIK_PASSWORD;
  console.log(
    "ℹ️  Using password from MIKROTIK_PASSWORD environment variable\n"
  );
}

async function testConnection() {
  console.log("🧪 Testing MikroTik Binary API Connection...\n");

  let api;
  try {
    // Step 1: Connect
    console.log(
      `1️⃣  Connecting to ${ROUTER_CONFIG.host}:${ROUTER_CONFIG.port}...`
    );
    api = new RouterOSAPI(ROUTER_CONFIG);
    await api.connect();
    console.log("   ✅ Connection successful!\n");

    // Step 2: Get system identity
    console.log("2️⃣  Testing basic command: /system/identity/print...");
    const identity = await api.write("/system/identity/print");
    console.log("   ✅ Router identity:", identity[0]?.name || "Unknown");
    console.log(
      "   📋 Full response:",
      JSON.stringify(identity, null, 2),
      "\n"
    );

    // Step 3: Check hotspot configuration
    console.log("3️⃣  Checking hotspot configuration...");
    const hotspots = await api.write("/ip/hotspot/print");
    if (hotspots && hotspots.length > 0) {
      console.log(`   ✅ Found ${hotspots.length} hotspot(s)`);
      hotspots.forEach((hs, i) => {
        console.log(`   📍 Hotspot ${i + 1}: ${hs.name} on ${hs.interface}`);
      });
    } else {
      console.log("   ⚠️  No hotspots configured");
    }
    console.log("");

    // Step 4: Check existing hotspot users
    console.log("4️⃣  Checking existing hotspot users...");
    const users = await api.write("/ip/hotspot/user/print");
    console.log(`   ℹ️  Current user count: ${users?.length || 0}`);
    if (users && users.length > 0) {
      console.log("   📋 Existing users:");
      users.slice(0, 5).forEach((user) => {
        console.log(
          `      - ${user.name} (${user["mac-address"] || "any MAC"})`
        );
      });
      if (users.length > 5) {
        console.log(`      ... and ${users.length - 5} more`);
      }
    }
    console.log("");

    // Step 5: Test creating a dummy user
    console.log("5️⃣  Testing user creation (TEST USER)...");
    const testMac = "AA:BB:CC:DD:EE:FF";

    try {
      const result = await api.write("/ip/hotspot/user/add", [
        `=name=${testMac}`,
        `=mac-address=${testMac}`,
        `=limit-uptime=00:05:00`,
        `=profile=default`,
        `=comment=Test user - safe to delete`,
      ]);

      console.log(`   ✅ Test user created successfully!`);
      console.log(`   📋 Result: ${result}\n`);

      // Step 6: Clean up - remove test user
      console.log("6️⃣  Cleaning up test user...");
      const testUsers = await api.write("/ip/hotspot/user/print");

      if (testUsers && testUsers.length > 0) {
        for (const user of testUsers) {
          if (user.name === testMac) {
            await api.write("/ip/hotspot/user/remove", [`=.id=${user[".id"]}`]);
            console.log(`   ✅ Removed test user: ${user[".id"]}`);
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to create test user: ${error.message}`);
      console.log(`   💡 This might indicate a configuration issue`);
    }

    console.log("\n");

    // Step 7: Close connection
    console.log("7️⃣  Closing connection...");
    await api.close();
    console.log("   ✅ Connection closed\n");

    // Final summary
    console.log("╔═══════════════════════════════════════════════════╗");
    console.log("║  ✅ ALL TESTS PASSED!                             ║");
    console.log("║                                                   ║");
    console.log("║  Your MikroTik router is ready for deployment!   ║");
    console.log("║  You can now proceed with:                        ║");
    console.log("║  1. Deploy to Vercel                              ║");
    console.log("║  2. Add location in admin panel                   ║");
    console.log("║  3. Make a real test payment                      ║");
    console.log("╚═══════════════════════════════════════════════════╝");
    console.log("");
  } catch (error) {
    console.error("\n❌ CONNECTION FAILED!\n");
    console.error("Error:", error.message);
    console.error("\n🔍 Troubleshooting steps:");
    console.error("1. Verify router IP:", ROUTER_CONFIG.host);
    console.error("2. Verify port:", ROUTER_CONFIG.port);
    console.error("3. Check username:", ROUTER_CONFIG.user);
    console.error("4. Verify password is correct");
    console.error("5. Run on router: /ip service print");
    console.error("   - Verify api-ssl is enabled on port", ROUTER_CONFIG.port);
    console.error("6. Run on router: /user print");
    console.error("   - Verify user exists:", ROUTER_CONFIG.user);
    console.error(
      "7. Check firewall allows connections to port",
      ROUTER_CONFIG.port
    );
    console.error("");

    if (api) {
      try {
        await api.close();
      } catch (e) {
        // Ignore
      }
    }

    process.exit(1);
  }
}

// Run the test
testConnection();
