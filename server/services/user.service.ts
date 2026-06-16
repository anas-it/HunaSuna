import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { LOGIN_BLOCK_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS } from "@/lib/constants";
import { addMinutes } from "@/lib/date";
import { normalizePhone } from "@/lib/phone";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import {
  deleteAccountSchema,
  settingsSchema
} from "@/server/validators/settings.validator";

type UpdateUserProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type DeleteCurrentUserAccountInput = {
  secretAnswer: string;
  confirmation: string;
};

const userProfileSelect = {
  id: true,
  login: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  secretQuestion: true
} satisfies Prisma.UserSelect;

function loginTarget(value: string) {
  return value.trim().toLowerCase();
}

function accountDeleteAttemptTarget(userId: string) {
  return `account-delete:${userId}`;
}

function recoveryAttemptTarget(value: string) {
  return `password-recovery:${loginTarget(value)}`;
}

function normalizeSecretAnswer(answer: string) {
  return answer.trim().toLowerCase();
}

async function assertAccountDeleteAllowed(userId: string, ipAddress?: string) {
  const since = addMinutes(new Date(), -LOGIN_BLOCK_MINUTES);

  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      target: accountDeleteAttemptTarget(userId),
      ipAddress,
      success: false,
      createdAt: {
        gte: since
      }
    }
  });

  if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    throw new Error(
      "Слишком много неправильных ответов. Попробуйте через 30 минут."
    );
  }
}

async function recordAccountDeleteAttempt(input: {
  userId: string;
  ipAddress?: string;
  success: boolean;
}) {
  await prisma.loginAttempt.create({
    data: {
      userId: input.userId,
      target: accountDeleteAttemptTarget(input.userId),
      ipAddress: input.ipAddress,
      success: input.success
    }
  });
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId
    },
    select: userProfileSelect
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
    },
    select: {
      firstName: true,
      lastName: true,
      phone: true
    }
  });

  if (!currentUser) {
    throw new Error("Пользователь не найден");
  }

  const nextPhone =
    data.phone !== undefined
      ? data.phone
        ? normalizePhone(data.phone)
        : null
      : currentUser.phone;
  const phoneChanged = nextPhone !== currentUser.phone;

  if (phoneChanged && nextPhone) {
    const existingPhone = await prisma.user.findUnique({
      where: {
        phone: nextPhone
      }
    });

    if (existingPhone) {
      throw new Error("Этот мобильный номер уже используется");
    }
  }

  const user = await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      firstName: data.firstName !== undefined ? data.firstName.trim() || null : currentUser.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() || null : currentUser.lastName,
      phone: nextPhone
    },
    select: userProfileSelect
  });

  await writeSecurityLog({
    action: "account_updated",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      phoneChanged
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
  const newEmail = input.newEmail.trim().toLowerCase();

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
    const existingEmail = await prisma.user.findFirst({
      where: {
        id: {
          not: userId
        },
        email: {
          equals: newEmail,
          mode: "insensitive"
        }
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
      email: newEmail
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

export async function deleteCurrentUserAccount(
  userId: string,
  input: DeleteCurrentUserAccountInput,
  meta?: { ipAddress?: string }
) {
  const data = deleteAccountSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      login: true,
      loginNormalized: true,
      phone: true,
      email: true,
      secretQuestion: true,
      secretAnswerHash: true
    }
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  if (!user.secretQuestion || !user.secretAnswerHash) {
    throw new Error("Для аккаунта не настроен секретный вопрос");
  }

  await assertAccountDeleteAllowed(user.id, meta?.ipAddress);

  if (
    !verifyPassword(
      normalizeSecretAnswer(data.secretAnswer),
      user.secretAnswerHash
    )
  ) {
    await recordAccountDeleteAttempt({
      userId: user.id,
      ipAddress: meta?.ipAddress,
      success: false
    });

    await writeSecurityLog({
      action: "account_delete_failed",
      userId: user.id,
      ipAddress: meta?.ipAddress,
      metadata: {
        reason: "secret_answer"
      }
    });

    throw new Error("Неверный секретный ответ");
  }

  const userTargets = [user.login, user.loginNormalized, user.phone, user.email]
    .filter((value): value is string => Boolean(value))
    .map(loginTarget);
  const loginAttemptTargets = Array.from(
    new Set([
      ...userTargets,
      ...userTargets.map(recoveryAttemptTarget),
      accountDeleteAttemptTarget(user.id)
    ])
  );

  await prisma.$transaction([
    prisma.securityLog.create({
      data: {
        action: "account_deleted",
        userId: user.id,
        ipAddress: meta?.ipAddress,
        metadata: {
          reason: "user_request"
        }
      }
    }),
    prisma.loginAttempt.deleteMany({
      where: {
        OR: [
          {
            userId: user.id
          },
          {
            target: {
              in: loginAttemptTargets
            }
          }
        ]
      }
    }),
    prisma.user.delete({
      where: {
        id: user.id
      }
    })
  ]);
}
