#!/usr/bin/env node

// Self-contained seed script that DOES NOT read .env.
// Usage:
//   node scripts/seed-operator.js <mongodb-connection-string> [email] [password]
// Example:
//   node scripts/seed-operator.js "mongodb+srv://user:pass@cluster/db" admin@realpowertech.com password123

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function run() {
  const connStrArg = process.argv[2];
  const emailArg = process.argv[3] || "admin@realpowertech.com";
  const passArg = process.argv[4] || "password123";

  if (!connStrArg) {
    console.error(
      "[seed-operator] Missing MongoDB connection string.\n" +
        "Usage: node scripts/seed-operator.js <mongodb-connection-string> [email] [password]"
    );
    process.exit(1);
  }

  console.log("[seed-operator] Connecting to MongoDB ...");
  await mongoose.connect(connStrArg);

  const OperatorSchema = new mongoose.Schema(
    {
      email: { type: String, unique: true, required: true, index: true },
      password: { type: String, required: true },
    },
    { collection: "operators", timestamps: true }
  );

  const Operator = mongoose.models.Operator || mongoose.model("Operator", OperatorSchema);

  const email = emailArg;
  const passwordPlain = passArg;

  const existing = await Operator.findOne({ email });
  if (existing) {
    console.log(`[seed-operator] Operator already exists: ${email} (no changes made)`);
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
