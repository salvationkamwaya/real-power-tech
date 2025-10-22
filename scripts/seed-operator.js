#!/usr/bin/env node

// Self-contained seed script with optional env support.
// Usage:
//   node scripts/seed-operator.js [mongodb-connection-string] [email] [password]
// If no connection string arg is provided, reads MONGODB_URI from .env.local or local.env.

const fs = require("fs");
const path = require("path");
let dotenvLoaded = false;
try {
  const dotenv = require("dotenv");
  // Load .env.local if present
  const envLocal = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal });
    dotenvLoaded = true;
  }
  // Load local.env if present (won't overwrite existing vars)
  const envFile = path.resolve(process.cwd(), "local.env");
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
    dotenvLoaded = true;
  }
} catch (_) {
  // dotenv not installed; try manual parse of local.env if present
  const envFile = path.resolve(process.cwd(), "local.env");
  if (fs.existsSync(envFile)) {
    const raw = fs.readFileSync(envFile, "utf8");
    raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .forEach((line) => {
        // Support lines like: KEY=VALUE or export KEY=VALUE
        const cleaned = line.startsWith("export ") ? line.slice(7) : line;
        const idx = cleaned.indexOf("=");
        if (idx > 0) {
          const key = cleaned.slice(0, idx).trim();
          let val = cleaned.slice(idx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
  }
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function run() {
  const argConn = process.argv[2];
  const emailArg = process.argv[3] || "admin@realpowertech.com";
  const passArg = process.argv[4] || "password123";

  const connStr = process.env.MONGODB_URI || argConn;

  if (!connStr) {
    console.error(
      "[seed-operator] Missing MongoDB connection string.\n" +
        (dotenvLoaded
          ? "Set MONGODB_URI in .env.local or local.env, or pass it as the first argument."
          : "Set MONGODB_URI in local.env (or pass it as the first argument).") +
        "\nUsage: node scripts/seed-operator.js [mongodb-connection-string] [email] [password]"
    );
    process.exit(1);
  }

  console.log("[seed-operator] Connecting to MongoDB ...");
  await mongoose.connect(connStr);

  const OperatorSchema = new mongoose.Schema(
    {
      email: { type: String, unique: true, required: true, index: true },
      password: { type: String, required: true },
    },
    { collection: "operators", timestamps: true }
  );

  const Operator =
    mongoose.models.Operator || mongoose.model("Operator", OperatorSchema);

  const email = emailArg;
  const passwordPlain = passArg;

  const existing = await Operator.findOne({ email });
  if (existing) {
    console.log(
      `[seed-operator] Operator already exists: ${email} (no changes made)`
    );
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(passwordPlain, 10);
  await Operator.create({ email, password: hash });
  console.log(`[seed-operator] Seeded operator: ${email}`);

  await mongoose.disconnect();
  console.log("[seed-operator] Done.");
}

run().catch(async (err) => {
  console.error("[seed-operator] Error:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
