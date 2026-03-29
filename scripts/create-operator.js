#!/usr/bin/env node

/**
 * Script to create an Operator user for the Real Power Tech WiFi Monetization Platform.
 * 
 * Usage: node scripts/create-operator.js <email> <password>
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Function to load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) return;

      const firstEqualIndex = trimmedLine.indexOf("=");
      if (firstEqualIndex !== -1) {
        const key = trimmedLine.substring(0, firstEqualIndex).trim();
        const value = trimmedLine.substring(firstEqualIndex + 1).trim();
        process.env[key] = value;
      }
    });
  }
}

async function run() {
  loadEnv();

  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: node scripts/create-operator.js <email> <password>");
    process.exit(1);
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB || "real-power-tech";

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not set in .env.local or environment.");
    process.exit(1);
  }

  console.log(`Connecting to MongoDB (${MONGODB_DB})...`);

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
    });
    console.log("Connected successfully.");

    // Define Schema (inline to avoid dependency issues in standalone script)
    const OperatorSchema = new mongoose.Schema(
      {
        email: { type: String, unique: true, required: true, index: true },
        password: { type: String, required: true },
      },
      { collection: "operators", timestamps: true }
    );

    const Operator = mongoose.models.Operator || mongoose.model("Operator", OperatorSchema);

    // Check if operator already exists
    const existing = await Operator.findOne({ email });
    if (existing) {
      console.log(`Operator with email ${email} already exists. Updating password...`);
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(password, salt);
      await existing.save();
      console.log(`Password updated for ${email}.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await Operator.create({
        email,
        password: hashedPassword
      });
      console.log(`Operator created successfully: ${email}`);
    }

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();
