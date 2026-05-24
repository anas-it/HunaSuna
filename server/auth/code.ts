import { createHash, randomInt } from "crypto";

function codeSecret() {
  return process.env.BETTER_AUTH_SECRET ?? "hunasuna-local-secret";
}

export function createNumericCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashCode(code: string) {
  return createHash("sha256")
    .update(`${codeSecret()}:${code.trim()}`)
    .digest("hex");
}

export function verifyCode(code: string, codeHash: string) {
  return hashCode(code) === codeHash;
}

