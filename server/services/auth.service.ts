import { prisma } from "@/server/db/prisma";
import { LOGIN_BLOCK_MINUTES, MAX_FAILED_LOGIN_ATTEMPTS } from "@/lib/constants";
import { addMinutes } from "@/lib/date";
import { normalizePhone } from "@/lib/phone";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import {
  loginSchema,
  passwordRecoverySchema,
  registerSchema
} from "@/server/validators/auth.validator";

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

type RegisterInput = {
  login: string;
  password: string;
  confirmPassword: string;
  secretQuestion: string;
  secretAnswer: string;
};

type LoginInput = {
  login: string;
  password: string;
};

function loginTarget(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSecretAnswer(answer: string) {
  return answer.trim().toLowerCase();
}

async function findUserForLogin(value: string) {
  const target = value.trim();
  const normalizedPhone = normalizePhone(target);

  return prisma.user.findFirst({
    where: {
      OR: [
        {
          login: target
        },
        {
          phone: normalizedPhone
        },
        {
          email: target
        }
      ]
    }
  });
}

async function recordLoginAttempt(input: {
  userId?: string;
  target: string;
  ipAddress?: string;
  success: boolean;
}) {
  await prisma.loginAttempt.create({
    data: input
  });
}

async function assertLoginAllowed(target: string, ipAddress?: string) {
  const since = addMinutes(new Date(), -LOGIN_BLOCK_MINUTES);

  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      target,
      ipAddress,
      success: false,
      createdAt: {
        gte: since
      }
    }
  });

  if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    throw new Error(
      "Слишком много неправильных попыток. Попробуйте через 30 минут."
    );
  }
}

export async function registerUser(input: RegisterInput, meta?: RequestMeta) {
  const data = registerSchema.parse({
    ...input,
    login: input.login.trim()
  });

  const existingUser = await prisma.user.findUnique({
    where: {
      login: data.login
    }
  });

  if (existingUser) {
    throw new Error("Пользователь с таким логином уже существует");
  }

  const user = await prisma.user.create({
    data: {
      login: data.login,
      passwordHash: hashPassword(data.password),
      phone: null,
      phoneVerified: true,
      email: null,
      emailUsableForRecovery: false,
      secretQuestion: data.secretQuestion.trim(),
      secretAnswerHash: hashPassword(normalizeSecretAnswer(data.secretAnswer))
    }
  });

  await writeSecurityLog({
    action: "register",
    userId: user.id,
    ipAddress: meta?.ipAddress
  });

  return {
    user
  };
}

export async function loginUser(input: LoginInput, meta?: RequestMeta) {
  const data = loginSchema.parse({
    login: input.login.trim(),
    password: input.password
  });
  const target = loginTarget(data.login);

  await assertLoginAllowed(target, meta?.ipAddress);

  const user = await findUserForLogin(data.login);

  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    await recordLoginAttempt({
      userId: user?.id,
      target,
      ipAddress: meta?.ipAddress,
      success: false
    });

    await writeSecurityLog({
      action: "login_failed",
      userId: user?.id,
      ipAddress: meta?.ipAddress,
      metadata: {
        target
      }
    });

    throw new Error("Неверный логин или пароль");
  }

  await recordLoginAttempt({
    userId: user.id,
    target,
    ipAddress: meta?.ipAddress,
    success: true
  });

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      lastLoginAt: new Date()
    }
  });

  await writeSecurityLog({
    action: "login",
    userId: user.id,
    ipAddress: meta?.ipAddress
  });

  return {
    user
  };
}

export async function requestPasswordRecovery(
  targetInput: string,
  meta?: RequestMeta
) {
  const target = targetInput.trim();

  if (!target) {
    throw new Error("Укажите логин");
  }

  const user = await prisma.user.findUnique({
    where: {
      login: target
    }
  });

  if (!user) {
    throw new Error("Аккаунт с таким логином не найден");
  }

  if (!user.secretQuestion || !user.secretAnswerHash) {
    throw new Error("Для этого аккаунта не настроен секретный вопрос");
  }

  await writeSecurityLog({
    action: "password_recovery",
    userId: user.id,
    ipAddress: meta?.ipAddress,
    metadata: {
      channel: "secret_question"
    }
  });

  return {
    secretQuestion: user.secretQuestion
  };
}

export async function resetPassword(input: {
  target: string;
  secretAnswer: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const data = passwordRecoverySchema.parse(input);
  const target = data.target.trim();

  const user = await prisma.user.findUnique({
    where: {
      login: target
    }
  });

  if (!user || !user.secretAnswerHash) {
    throw new Error("Аккаунт не найден или секретный вопрос не настроен");
  }

  if (
    !verifyPassword(
      normalizeSecretAnswer(data.secretAnswer),
      user.secretAnswerHash
    )
  ) {
    await writeSecurityLog({
      action: "password_recovery_failed",
      userId: user.id,
      metadata: {
        reason: "secret_answer"
      }
    });

    throw new Error("Неверный секретный ответ");
  }

  const loginAttemptTargets = Array.from(
    new Set(
      [target, user.login, user.phone, user.email]
        .filter((value): value is string => Boolean(value))
        .map(loginTarget)
    )
  );

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        passwordHash: hashPassword(data.newPassword)
      }
    }),
    prisma.loginAttempt.deleteMany({
      where: {
        success: false,
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
    })
  ]);

  await writeSecurityLog({
    action: "password_reset",
    userId: user.id
  });
}
