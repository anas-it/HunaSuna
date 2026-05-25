import { prisma } from "@/server/db/prisma";
import { normalizePhone } from "@/lib/phone";
import { hashPassword, verifyPassword } from "@/server/auth/password";
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
  const emailChanged = data.email !== undefined && data.email !== currentUser.email;

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

  if (data.email && emailChanged) {
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
      phone: nextPhone,
      phoneVerified: phoneChanged ? false : currentUser.phoneVerified,
      ...(data.email !== undefined
        ? {
            email: data.email ?? null,
            emailUsableForRecovery: Boolean(data.email)
          }
        : {}),
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
      emailChanged,
      passwordChanged: Boolean(data.newPassword)
    }
  });

  return {
    user,
    phoneChanged
  };
}

export async function updateUserPassword(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
  },
  meta?: { ipAddress?: string }
) {
  const currentPassword = input.currentPassword.trim();
  const newPassword = input.newPassword.trim();

  if (!currentPassword || newPassword.length < 4) {
    throw new Error("Укажите текущий пароль и новый пароль минимум 4 символа");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw new Error("Текущий пароль указан неверно");
  }

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      passwordHash: hashPassword(newPassword)
    }
  });

  await writeSecurityLog({
    action: "account_updated",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      passwordChanged: true
    }
  });
}

export async function updateUserEmail(
  userId: string,
  input: {
    currentEmail?: string;
    newEmail: string;
  },
  meta?: { ipAddress?: string }
) {
  const currentEmail = input.currentEmail?.trim() || "";
  const newEmail = input.newEmail.trim();

  if (!newEmail || !newEmail.includes("@")) {
    throw new Error("Укажите корректный новый email");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (user.email && currentEmail.toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("Текущий email указан неверно");
  }

  if (newEmail !== user.email) {
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: newEmail
      }
    });

    if (existingEmail) {
      throw new Error("Этот email уже используется");
    }
  }

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      email: newEmail,
      emailUsableForRecovery: true
    }
  });

  await writeSecurityLog({
    action: "account_updated",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      emailChanged: true
    }
  });
}

export async function revealUserSensitiveData(
  userId: string,
  currentPassword: string,
  meta?: { ipAddress?: string }
) {
  const password = currentPassword.trim();

  if (!password) {
    throw new Error("Введите текущий пароль");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      email: true,
      passwordHash: true,
      phone: true
    }
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error("Текущий пароль указан неверно");
  }

  await writeSecurityLog({
    action: "sensitive_data_viewed",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      emailShown: Boolean(user.email),
      phoneShown: true
    }
  });

  return {
    email: user.email,
    phone: user.phone
  };
}
