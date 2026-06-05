import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { findUserBySessionToken, getCurrentUser } from "@/server/auth/session";

export function sessionTokenFromAuthorization(authorization: string | null) {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function getBearerSessionToken() {
  const headerStore = await headers();

  return sessionTokenFromAuthorization(headerStore.get("authorization"));
}

export async function requireApiUser() {
  const bearerToken = await getBearerSessionToken();
  const user = bearerToken ? await findUserBySessionToken(bearerToken) : await getCurrentUser();

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
