import { NextRequest, NextResponse } from "next/server";
import { getRequestMeta } from "@/server/auth/request";
import { apiError, requireApiUser } from "@/server/auth/api";
import { updateUserProfile } from "@/server/services/user.service";

function publicUser(user: {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  phoneVerified: boolean;
  email: string | null;
}) {
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

export async function PATCH(request: NextRequest) {
  const { user, response } = await requireApiUser();

  if (!user) {
    return response;
  }

  try {
    const body = await request.json();
    const meta = await getRequestMeta();
    const result = await updateUserProfile(user.id, body, meta);

    return NextResponse.json({
      ok: true,
      user: publicUser(result.user),
      phoneChanged: result.phoneChanged
    });
  } catch (error) {
    return apiError(error);
  }
}
