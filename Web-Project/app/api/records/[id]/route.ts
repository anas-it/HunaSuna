import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import {
  deleteRecord,
  getRecord,
  updateRecord
} from "@/server/services/record.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;
    const record = await getRecord(user.id, id);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return apiError(error, 404);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const meta = await getRequestMeta();
    const record = await updateRecord(user.id, id, body, meta.timezone, meta);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const { id } = await context.params;
    const meta = await getRequestMeta();
    const record = await deleteRecord(user.id, id, meta);
    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return apiError(error);
  }
}
