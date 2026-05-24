import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import {
  deleteContact,
  getContactHistory,
  updateContact
} from "@/server/services/contact.service";

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
    const data = await getContactHistory(user.id, id);
    return NextResponse.json({ ok: true, ...data });
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
    const contact = await updateContact(user.id, id, body, meta);
    return NextResponse.json({ ok: true, contact });
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
    await deleteContact(user.id, id, meta);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

