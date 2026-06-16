import { NextRequest, NextResponse } from "next/server";
import {
  apiError,
  getBearerSessionToken,
  requireApiUser
} from "@/server/auth/api";
import { getRequestMeta } from "@/server/auth/request";
import { destroyCurrentSession } from "@/server/auth/session";
import {
  deleteCurrentUserAccount,
  getUserProfile
} from "@/server/services/user.service";

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

function bodyText(body: unknown, key: string) {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export async function DELETE(request: NextRequest) {
  const bearerToken = await getBearerSessionToken();
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const meta = await getRequestMeta();
    await deleteCurrentUserAccount(
      user.id,
      {
        secretAnswer: bodyText(body, "secretAnswer"),
        confirmation: bodyText(body, "confirmation")
      },
      meta
    );
    if (!bearerToken) {
      await destroyCurrentSession();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
