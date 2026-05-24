import { headers } from "next/headers";

export async function getRequestMeta() {
  const headerStore = await headers();

  const forwardedFor = headerStore.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "127.0.0.1";

  const timezone =
    headerStore.get("x-vercel-ip-timezone") ??
    headerStore.get("cf-timezone") ??
    Intl.DateTimeFormat().resolvedOptions().timeZone ??
    "UTC";

  return {
    ipAddress,
    timezone,
    userAgent: headerStore.get("user-agent") ?? undefined
  };
}

