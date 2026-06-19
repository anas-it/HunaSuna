import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import { createContact, listContactsPage } from "@/server/services/contact.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  const searchParams = request.nextUrl.searchParams;
  const result = await listContactsPage(user.id, {
    query: searchParams.get("query"),
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
    const contact = await createContact(user.id, body, meta);

    return NextResponse.json({ ok: true, contact }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
