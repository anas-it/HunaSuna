import { prisma } from "@/server/db/prisma";
import { normalizePhone } from "@/lib/phone";
import { hashPassword } from "@/server/auth/password";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import { settingsSchema } from "@/server/validators/settings.validator";

type UpdateUserProfileInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  newPassword?: string;
};

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      login: true,
      firstName: true,
      lastName: true,
      phone: true,
      phoneVerified: true,
      email: true,
      emailUsableForRecovery: true,
      createdAt: true,
      lastLoginAt: true
    }
  });
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput,
  meta?: { ipAddress?: string }
) {
  const data = settingsSchema.parse(input);
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!currentUser) {
    throw new Error("Пользователь не найден");
  }

  const nextPhone = data.phone ? normalizePhone(data.phone) : currentUser.phone;
  const phoneChanged = nextPhone !== currentUser.phone;

  if (phoneChanged) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: nextPhone
      }
    });

    if (existingPhone) {
      throw new Error("Этот мобильный номер уже используется");
    }
  }

  if (data.email && data.email !== currentUser.email) {
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });

    if (existingEmail) {
      throw new Error("Этот email уже используется");
    }
  }

  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      firstName: data.firstName?.trim() || null,
      lastName: data.lastName?.trim() || null,
      email: data.email ?? null,
      emailUsableForRecovery: Boolean(data.email),
      phone: nextPhone,
      phoneVerified: phoneChanged ? false : currentUser.phoneVerified,
      ...(data.newPassword
        ? {
            passwordHash: hashPassword(data.newPassword)
          }
        : {})
    }
  });

  await writeSecurityLog({
    action: "account_updated",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      phoneChanged,
      emailChanged: data.email !== currentUser.email,
      passwordChanged: Boolean(data.newPassword)
    }
  });

  return {
    user,
    phoneChanged
  };
}
