#!/usr/bin/env node

// Self-contained seed script
// Usage: node scripts/seed-operator.js [email] [password]

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://jestone002:CpQaNvoPeYt0rYvV@cluster0.oqfo3zc.mongodb.net/real-power-tech?appName=Cluster0";

async function run() {
  const emailArg = process.argv[2] || "jestone002@gmail.com";
  const passArg = process.argv[3] || "password123";

  console.log("[seed-operator] Connecting to MongoDB ...");
  await mongoose.connect(MONGODB_URI, {
    dbName: "real-power-tech",
  });

  console.log(
    `[seed-operator] Connected to database: ${mongoose.connection.db.databaseName}`
  );

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
