import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/server/auth/api";
import { listDeletedRecordsPage } from "@/server/services/deleted-record.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const result = await listDeletedRecordsPage(user.id, {
    page: searchParams.get("page"),
    limit: searchParams.get("limit")
  });

  return NextResponse.json({ ok: true, ...result });
}
