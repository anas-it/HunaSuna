import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { createSession, destroyCurrentSession } from "@/server/auth/session";
import { apiError } from "@/server/auth/api";
import {
  loginUser,
  registerUser,
  requestPasswordRecovery,
  resetPassword
} from "@/server/services/auth.service";

type ApiUser = {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
};

function publicUser(user: ApiUser) {
  return {
    id: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    email: user.email
  };
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

    if (action === "register") {
      const result = await registerUser(body, meta);
      await createSession(result.user.id, meta);
      return NextResponse.json({
        ok: true,
        user: publicUser(result.user),
        phoneVerified: result.user.phoneVerified
      });
    }

    if (action === "login") {
      const result = await loginUser(body, meta);
      await createSession(result.user.id, meta, {
        remember: Boolean(body.remember)
      });
      return NextResponse.json({
        ok: true,
        user: publicUser(result.user),
        phoneVerified: result.user.phoneVerified
      });
    }

    if (action === "logout") {
      await destroyCurrentSession();
      return NextResponse.json({ ok: true });
    }

    if (action === "request-password-recovery") {
      const result = await requestPasswordRecovery(body.target, meta);
      return NextResponse.json({ ok: true, secretQuestion: result.secretQuestion });
    }

    if (action === "reset-password") {
      await resetPassword(body);
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
