import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { createSession, destroyCurrentSession, destroySessionToken, type CreatedSession } from "@/server/auth/session";
import { apiError, sessionTokenFromAuthorization } from "@/server/auth/api";
import {
  loginUser,
  registerUser,
  requestPasswordRecovery,
  resetPassword
} from "@/server/services/auth.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

type ApiUser = {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
};

function publicUser(user: ApiUser) {
  return {
    id: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email
  };
}

function wantsMobileSession(request: NextRequest, body: Record<string, unknown>) {
  return body.client === "mobile" || request.headers.get("x-hunasuna-client")?.toLowerCase() === "mobile";
}

function authSuccess(user: ApiUser, session: CreatedSession, includeSession: boolean) {
  const responseBody: {
    ok: true;
    user: ReturnType<typeof publicUser>;
    session?: {
      token: string;
      expiresAt: string;
    };
  } = {
    ok: true,
    user: publicUser(user)
  };

  if (includeSession) {
    responseBody.session = {
      token: session.token,
      expiresAt: session.expiresAt.toISOString()
    };
  }

  return NextResponse.json(responseBody);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "HunaSuna auth API"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;
    const meta = await getRequestMeta();
    const includeSession = wantsMobileSession(request, body);

    if (action === "register") {
      const result = await registerUser(body, meta);
      const session = await createSession(result.user.id, meta);
      return authSuccess(result.user, session, includeSession);
    }

    if (action === "login") {
      const result = await loginUser(body, meta);
      const session = await createSession(result.user.id, meta, {
        remember: Boolean(body.remember)
      });
      return authSuccess(result.user, session, includeSession);
    }

    if (action === "logout") {
      const bearerToken = sessionTokenFromAuthorization(request.headers.get("authorization"));

      if (bearerToken) {
        await destroySessionToken(bearerToken);
      }

      await destroyCurrentSession();
      return NextResponse.json({ ok: true });
    }

    if (action === "request-password-recovery") {
      const result = await requestPasswordRecovery(body.target, meta);
      return NextResponse.json({ ok: true, secretQuestion: result.secretQuestion });
    }

    if (action === "reset-password") {
      await resetPassword(body, meta);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        ok: false,
        message: "Неизвестное действие"
      },
      { status: 400 }
    );
  } catch (error) {
    return apiError(error);
  }
}
