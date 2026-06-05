import { headers } from "next/headers";

function validTimezone(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    new Intl.DateTimeFormat("ru-RU", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return null;
  }
}

export async function getRequestMeta() {
  const headerStore = await headers();

  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "127.0.0.1";

  const timezone =
    validTimezone(headerStore.get("x-hunasuna-timezone")) ??
    validTimezone(headerStore.get("x-vercel-ip-timezone")) ??
    validTimezone(headerStore.get("cf-timezone")) ??
    Intl.DateTimeFormat().resolvedOptions().timeZone ??
    "UTC";

  return {
    ipAddress,
    timezone,
    userAgent: headerStore.get("user-agent") ?? undefined
  };
}
