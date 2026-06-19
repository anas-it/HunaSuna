import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/server/auth/api";
import { searchRecords } from "@/server/services/search.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const result = await searchRecords(user.id, {
    query: searchParams.get("query") ?? undefined,
    contactId: searchParams.get("contactId") ?? undefined,
    favorite: searchParams.get("favorite"),
    phone: searchParams.get("phone") ?? undefined,
    page: searchParams.get("page"),
    limit: searchParams.get("limit")
  });

  return NextResponse.json({ ok: true, ...result });
}
