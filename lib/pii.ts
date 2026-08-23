// Field-level encryption for personally identifiable data (card contacts'
// postal addresses). AES-256-GCM with a key that lives ONLY in env
// (PII_ENCRYPTION_KEY, 32 bytes base64 — generate: `openssl rand -base64 32`),
// never in git, the database, or the data-volume backups. That separation is
// the point: a copy of the SQLite file alone cannot reveal addresses.
//
// Envelope format: "v1:<iv b64>:<authTag b64>:<ciphertext b64>". Losing or
// changing the key makes existing envelopes undecryptable (the UI shows
// DECRYPT_FAILED for those) — everything else in the app is unaffected.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** Sentinel returned when an envelope can't be decrypted (wrong/rotated key
 *  or corrupt data). UIs must render this as a "can't decrypt" state — never
 *  treat it as an actual address. */
export const DECRYPT_FAILED = Symbol("pii-decrypt-failed");

function key(): Buffer {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "PII_ENCRYPTION_KEY is not set — generate one with `openssl rand -base64 32` and add it to .env (see .env.example).",
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error(
      "PII_ENCRYPTION_KEY must be 32 bytes of base64 (openssl rand -base64 32).",
    );
  }
  return buf;
}

/** Encrypt a piece of PII for storage. Empty/whitespace input returns null —
 *  store nothing rather than an envelope of nothing. */
export function encryptPII(plain: string): string | null {
  const text = plain.trim();
  if (!text) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ct.toString("base64")}`;
}

/** Decrypt a stored envelope. null in → null out; a bad envelope or wrong
 *  key returns DECRYPT_FAILED instead of throwing, so one broken row can't
 *  take down a whole page. */
export function decryptPII(envelope: string | null): string | null | typeof DECRYPT_FAILED {
  if (envelope === null) return null;
  try {
    const [version, ivB64, tagB64, ctB64] = envelope.split(":");
    if (version !== "v1" || !ivB64 || !tagB64 || !ctB64) return DECRYPT_FAILED;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(ctB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return DECRYPT_FAILED;
  }
}
