import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import { createRecord, listRecordsPage } from "@/server/services/record.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const result = await listRecordsPage(user.id, {
    query: searchParams.get("query") ?? undefined,
    contactId: searchParams.get("contactId") ?? undefined,
    phone: searchParams.get("phone") ?? undefined,
    page: searchParams.get("page"),
    limit: searchParams.get("limit")
  });

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const body = await request.json();
    const meta = await getRequestMeta();
    const record = await createRecord(user.id, body, meta.timezone, meta);

    return NextResponse.json({ ok: true, record }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
