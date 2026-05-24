import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { getCurrentUser } from "@/server/auth/session";
import { apiError } from "@/server/auth/api";
import { verifyPhone } from "@/server/services/auth.service";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "Нужно войти в аккаунт"
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const meta = await getRequestMeta();
    await verifyPhone(
      user.id,
      {
        phone: user.phone,
        code: body.code
      },
      meta
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

