export function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "");
}
