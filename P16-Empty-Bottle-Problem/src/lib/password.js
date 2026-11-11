import crypto from "crypto";

// Password hashing with "scrypt", which is built into Node.js
// (no extra library needed).
//
// We store:  salt:hash
// - salt = random text, so two people with the same password get different hashes
// - hash = the scrambled password (it cannot be turned back into the password)

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return salt + ":" + hash;
}

// Returns true if the password matches the stored "salt:hash"
export function checkPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;

  const [salt, hash] = storedHash.split(":");
  const realHash = Buffer.from(hash, "hex");
  const testHash = crypto.scryptSync(password, salt, 64);

  // timingSafeEqual compares in a way that does not leak information
  return realHash.length === testHash.length && crypto.timingSafeEqual(realHash, testHash);
}
