import { NextResponse } from "next/server";
import { requireApiUser } from "@/server/auth/api";
import { getUserProfile } from "@/server/services/user.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET() {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const profile = await getUserProfile(user.id);
  return NextResponse.json({ ok: true, user: profile });
}
