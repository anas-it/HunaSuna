import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";

export const SESSION_COOKIE = "hunasuna_session";

const SESSION_DAYS = 30;
const SESSION_HOURS = 12;

export type CurrentUser = {
  id: string;
  login: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  email: string | null;
};

export type CreatedSession = {
  token: string;
  expiresAt: Date;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionExpiresAt(remember: boolean) {
  const expiresAt = new Date();

  if (remember) {
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  } else {
    expiresAt.setHours(expiresAt.getHours() + SESSION_HOURS);
  }

  return expiresAt;
}

export async function createSession(
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string },
  options?: { remember?: boolean }
): Promise<CreatedSession> {
  const remember = Boolean(options?.remember);
  const token = randomBytes(32).toString("hex");
  const expiresAt = sessionExpiresAt(remember);

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
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  } as const;

  if (remember) {
    cookieStore.set(SESSION_COOKIE, token, {
      ...cookieOptions,
      expires: expiresAt
    });
  } else {
    cookieStore.set(SESSION_COOKIE, token, cookieOptions);
  }

  return { token, expiresAt };
}

export async function findUserBySessionToken(token: string): Promise<CurrentUser | null> {
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
    select: {
      user: {
        select: {
          id: true,
          login: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true
        }
      }
    }
  });

  if (!session) {
    return null;
  }

  return session.user;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return token ? findUserBySessionToken(token) : null;
}

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Войдите в аккаунт")}`);
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

export async function redirectAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  redirect("/dashboard");
}

export async function destroySessionToken(token: string) {
  if (!token) {
    return;
  }

  await prisma.userSession.deleteMany({
    where: {
      tokenHash: hashSessionToken(token)
    }
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await destroySessionToken(token);
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
