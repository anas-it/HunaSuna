import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  const [method, salt, storedHash] = passwordHash.split(":");

  if (method !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const hash = scryptSync(password, salt, KEY_LENGTH);
  const stored = Buffer.from(storedHash, "hex");

  if (hash.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(hash, stored);
}

