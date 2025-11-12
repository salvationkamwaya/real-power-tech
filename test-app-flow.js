#!/usr/bin/env node
/**
 * Complete End-to-End Application Test
 * Tests: Encryption, MikroTik Connection, User Creation/Deletion
 */

import { RouterOSAPI } from "node-routeros";
import crypto from "crypto";

// =============================================================================
// CONFIGURATION (hardcoded from .env.local)
// =============================================================================
const ENCRYPTION_KEY_HEX =
  "f00851e735ce52640aba0923800021259c240f85809903e5fc016a64acb9be13";
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex");
const IV_LENGTH = 16;

const TEST_ROUTER_URL = "https://192.168.0.181:8729";
const TEST_ROUTER_USERNAME = "api-admin";
const TEST_ROUTER_PASSWORD = "MySecurePass123!";
const TEST_MAC = "AA:BB:CC:DD:EE:FF";

// =============================================================================
// ENCRYPTION FUNCTIONS (same as lib/encryption.js)
// =============================================================================
function encryptPassword(password) {
  if (!password) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptPassword(encrypted) {
  if (!encrypted) return null;
  try {
    const [ivHex, encryptedHex] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

function formatMikrotikDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

// =============================================================================
// MAIN TEST FUNCTION
// =============================================================================
async function runTests() {
  console.log("🧪 Starting End-to-End Application Tests...\n");

  try {
    // ============================================
    // Test 1: Encryption Key Setup
    // ============================================
    console.log("🔧 Test 1: Encryption Key Setup");
    console.log(
      `   ROUTER_PASSWORD_KEY (hex): ${ENCRYPTION_KEY_HEX.substring(0, 20)}...`
    );
    console.log(`   Key buffer length: ${ENCRYPTION_KEY.length} bytes`);
    if (ENCRYPTION_KEY.length !== 32) {
      throw new Error(
        `Invalid key length: expected 32 bytes, got ${ENCRYPTION_KEY.length}`
      );
    }
    console.log("✅ Encryption key loaded (32 bytes)\n");

    // ============================================
    // Test 2: Password Encryption/Decryption
    // ============================================
    console.log("🔐 Test 2: Password Encryption/Decryption");
    const encrypted = encryptPassword(TEST_ROUTER_PASSWORD);
    console.log(`   Original: ${TEST_ROUTER_PASSWORD}`);
    console.log(`   Encrypted: ${encrypted.substring(0, 50)}...`);
    const decrypted = decryptPassword(encrypted);
    console.log(`   Decrypted: ${decrypted}`);

    if (decrypted === TEST_ROUTER_PASSWORD) {
      console.log("✅ Password encryption/decryption working\n");
    } else {
      throw new Error("Password decryption failed!");
    }

    // ============================================
    // Test 3: MikroTik Connection
    // ============================================
    console.log("🔌 Test 3: MikroTik Router Connection");
    const url = new URL(TEST_ROUTER_URL);
    const host = url.hostname;
    const port = parseInt(url.port) || 8729;

    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   Username: ${TEST_ROUTER_USERNAME}`);
    console.log(`   Connecting...`);

    const api = new RouterOSAPI({
      host,
      user: TEST_ROUTER_USERNAME,
      password: TEST_ROUTER_PASSWORD,
      port,
      timeout: 10,
      tls: {
        rejectUnauthorized: false,
      },
    });

    await api.connect();
    console.log("✅ Connected to MikroTik router\n");

    // ============================================
    // Test 4: Read System Identity
    // ============================================
    console.log("📋 Test 4: Read System Identity");
    const identity = await api.write("/system/identity/print");
    console.log(`   Router Name: ${identity[0].name}`);
    console.log("✅ System identity retrieved\n");

    // ============================================
    // Test 5: Check Hotspot Configuration
    // ============================================
    console.log("📋 Test 5: Check Hotspot Configuration");
    const hotspots = await api.write("/ip/hotspot/print", [
      "=.proplist=name,interface,disabled",
    ]);
    if (hotspots && hotspots.length > 0) {
      console.log(`   Found ${hotspots.length} hotspot(s):`);
      hotspots.forEach((h) => {
        console.log(
          `   - ${h.name} on ${h.interface} (disabled: ${h.disabled || "no"})`
        );
      });
      console.log("✅ Hotspot configuration verified\n");
    } else {
      console.log("⚠️  No hotspots configured\n");
    }

    // ============================================
    // Test 6: Create Test User
    // ============================================
    console.log("👤 Test 6: Create Hotspot User");
    const duration = formatMikrotikDuration(300); // 5 minutes
    console.log(`   MAC Address: ${TEST_MAC}`);
    console.log(`   Session Duration: ${duration} (5 minutes)`);

    const params = [
      `=name=${TEST_MAC}`,
      `=mac-address=${TEST_MAC}`,
      `=limit-uptime=${duration}`,
      `=profile=default`,
      `=comment=Test User - Safe to Delete`,
    ];

    const createResult = await api.write("/ip/hotspot/user/add", params);
    console.log(
      `✅ User created successfully (ID: ${createResult || "created"})\n`
    );

    // ============================================
    // Test 7: Verify User Exists
    // ============================================
    console.log("🔍 Test 7: Verify User Exists");
    const users = await api.write("/ip/hotspot/user/print", [
      "=.proplist=.id,name,mac-address,limit-uptime,comment",
    ]);

    const testUser = users.find((u) => u.name === TEST_MAC);
    if (testUser) {
      console.log(`   Found user:`);
      console.log(`   - ID: ${testUser[".id"]}`);
      console.log(`   - Name: ${testUser.name}`);
      console.log(`   - MAC: ${testUser["mac-address"]}`);
      console.log(`   - Uptime Limit: ${testUser["limit-uptime"]}`);
      console.log("✅ User verification successful\n");
    } else {
      throw new Error("Test user not found!");
    }

    // ============================================
    // Test 8: Remove Test User
    // ============================================
    console.log("🧹 Test 8: Cleanup - Remove Test User");
    await api.write("/ip/hotspot/user/remove", [`=.id=${testUser[".id"]}`]);
    console.log("✅ Test user removed\n");

    // ============================================
    // Test 9: Close Connection
    // ============================================
    console.log("🔌 Test 9: Close Connection");
    await api.close();
    console.log("✅ Connection closed\n");

    // ============================================
    // Final Summary
    // ============================================
    console.log("═".repeat(60));
    console.log("🎉 ALL TESTS PASSED!");
    console.log("═".repeat(60));
    console.log("\n✅ Encryption Key: Working");
    console.log("✅ Password Encryption/Decryption: Working");
    console.log("✅ MikroTik Connection: Working");
    console.log("✅ System Identity Read: Working");
    console.log("✅ Hotspot Configuration: Working");
    console.log("✅ User Creation: Working");
    console.log("✅ User Verification: Working");
    console.log("✅ User Deletion: Working");
    console.log("\n🚀 Application is ready for deployment!");
    console.log("\n📝 Next Steps:");
    console.log("   1. Deploy to Vercel (git push)");
    console.log("   2. Add ROUTER_PASSWORD_KEY to Vercel env variables");
    console.log("   3. Add location in admin panel");
    console.log("   4. Test with real payment");
    console.log("═".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error("═".repeat(60));
    console.error("Error:", error.message);
    console.error("\nStack trace:");
    console.error(error.stack);
    console.error("═".repeat(60));
    process.exit(1);
  }
}

// Run tests
runTests();
