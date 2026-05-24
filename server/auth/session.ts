import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";

export const SESSION_COOKIE = "hunasuna_session";

const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string;
  phoneVerified: boolean;
  email: string | null;
  emailUsableForRecovery: boolean;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string }
) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = sessionExpiresAt();

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.userSession.findFirst({
    where: {
      tokenHash: hashSessionToken(token),
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  return session.user;
}

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Войдите в аккаунт")}`);
  }

  if (!user.phoneVerified) {
    redirect("/verify-phone");
  }

  return user;
}

export async function requirePageSessionUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Войдите в аккаунт")}`);
  }

  return user;
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.userSession.deleteMany({
      where: {
        tokenHash: hashSessionToken(token)
      }
    });
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
