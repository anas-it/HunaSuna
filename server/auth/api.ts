import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          ok: false,
          message: "Нужно войти в аккаунт"
        },
        { status: 401 }
      )
    };
  }

  if (!user.phoneVerified) {
    return {
      user: null,
      response: NextResponse.json(
        {
          ok: false,
          message: "Нужно подтвердить мобильный номер"
        },
        { status: 403 }
      )
    };
  }

  return {
    user,
    response: null
  };
}

export function apiError(error: unknown, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      message: error instanceof Error ? error.message : "Ошибка запроса"
    },
    { status }
  );
}

