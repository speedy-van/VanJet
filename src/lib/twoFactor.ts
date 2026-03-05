// ─── VanJet · Two-Factor Authentication (TOTP) ────────────────
// Uses otplib for TOTP generation and verification.
// Secrets are encrypted at rest using AES-256-GCM.

import { generateSecret, verify } from "otplib";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Get the encryption key from environment.
 * Must be a 64-character hex string (32 bytes).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TWO_FACTOR_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "[VanJet] TWO_FACTOR_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(key, "hex");
}

/** Encrypt a plaintext TOTP secret for safe database storage. */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Format: iv:tag:ciphertext (all base64)
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

/** Decrypt an encrypted TOTP secret from the database. */
export function decryptSecret(encryptedStr: string): string {
  // Handle legacy unencrypted secrets (plain base32 strings without colons)
  if (!encryptedStr.includes(":")) {
    return encryptedStr;
  }

  const key = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = encryptedStr.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/** Generate a new TOTP secret for 2FA setup. Returns encrypted secret + raw secret for QR code. */
export function generateTwoFactorSecret(): {
  encrypted: string;
  raw: string;
} {
  const raw = generateSecret();
  const encrypted = encryptSecret(raw);
  return { encrypted, raw };
}

/** Verify a TOTP token against the user's (possibly encrypted) secret. */
export async function verifyTwoFactorToken(
  storedSecret: string,
  token: string
): Promise<boolean> {
  const secret = decryptSecret(storedSecret);
  const result = await verify({ secret, token });
  return result.valid;
}
