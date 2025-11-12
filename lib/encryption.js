import crypto from "crypto";

// Use environment variable for encryption key (must be 32 bytes)
const ENCRYPTION_KEY =
  process.env.ROUTER_PASSWORD_KEY || "default-32-byte-key-change-this!!"; // Must be 32 chars
const IV_LENGTH = 16;

/**
 * Encrypt a password for storage in database
 * @param {string} password - Plain text password
 * @returns {string} - Encrypted password (iv:encrypted format)
 */
export function encryptPassword(password) {
  if (!password) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    iv
  );

  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt a password from database
 * @param {string} encrypted - Encrypted password (iv:encrypted format)
 * @returns {string} - Plain text password
 */
export function decryptPassword(encrypted) {
  if (!encrypted) return null;

  try {
    const [ivHex, encryptedHex] = encrypted.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv
    );

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Password decryption error:", error);
    return null;
  }
}
