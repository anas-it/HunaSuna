export function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "");
}

export function normalizePhoneForSearch(phone: string) {
  return phone.replace(/\D/g, "");
}
