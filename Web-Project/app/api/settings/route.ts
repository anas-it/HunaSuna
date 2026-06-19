import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import {
  revealUserSensitiveData,
  updateUserEmail,
  updateUserPassword,
  updateUserProfile
} from "@/server/services/user.service";

export const preferredRegion = "fra1";
export const runtime = "nodejs";

function publicUser(user: {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
}) {
  return {
    id: user.id,
    login: user.login,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    email: user.email
  };
}

function stringField(body: Record<string, unknown>, key: string) {
  return typeof body[key] === "string" ? body[key] : "";
}

export async function PATCH(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const body = await request.json();
    const meta = await getRequestMeta();
    const action = body.action ?? "profile";

    if (action === "profile") {
      if ("email" in body || "newPassword" in body) {
        throw new Error("Email и пароль меняются отдельными действиями");
      }

      const result = await updateUserProfile(
        user.id,
        {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone
        },
        meta
      );

      return NextResponse.json({
        ok: true,
        user: publicUser(result.user),
        phoneChanged: result.phoneChanged
      });
    }

    if (action === "password") {
      await updateUserPassword(
        user.id,
        {
          currentPassword: stringField(body, "currentPassword"),
          newPassword: stringField(body, "newPassword")
        },
        meta
      );

      return NextResponse.json({ ok: true });
    }

    if (action === "email") {
      await updateUserEmail(
        user.id,
        {
          currentEmail: stringField(body, "currentEmail"),
          newEmail: stringField(body, "newEmail")
        },
        meta
      );

      return NextResponse.json({ ok: true });
    }

    if (action === "reveal-sensitive") {
      const data = await revealUserSensitiveData(user.id, stringField(body, "currentPassword"), meta);

      return NextResponse.json({
        ok: true,
        data
      });
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
