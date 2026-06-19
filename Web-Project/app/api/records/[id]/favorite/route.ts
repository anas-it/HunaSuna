import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import { updateRecordFavorite } from "@/server/services/record.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const meta = await getRequestMeta();
    const record = await updateRecordFavorite(user.id, id, Boolean(body.isFavorite), meta);

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return apiError(error);
  }
}
