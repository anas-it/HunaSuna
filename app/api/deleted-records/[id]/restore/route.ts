import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import { restoreDeletedRecord } from "@/server/services/deleted-record.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, context: RouteContext) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;
    const meta = await getRequestMeta();
    const record = await restoreDeletedRecord(user.id, id, meta);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return apiError(error);
  }
}
