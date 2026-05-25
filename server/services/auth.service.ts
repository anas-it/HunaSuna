import { prisma } from "@/server/db/prisma";
import {
  LOGIN_BLOCK_MINUTES,
  MAX_FAILED_LOGIN_ATTEMPTS,
  MAX_SMS_PER_WINDOW,
  PASSWORD_RECOVERY_CODE_TTL_MINUTES,
  SMS_CODE_TTL_MINUTES,
  SMS_WINDOW_MINUTES
} from "@/lib/constants";
import { addMinutes } from "@/lib/date";
import { normalizePhone } from "@/lib/phone";
import { createNumericCode, hashCode, verifyCode } from "@/server/auth/code";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import {
  isSmsProviderConfigured,
  sendSmsCode,
  verifySmsCode
} from "@/server/sms/sms.service";
import {
  loginSchema,
  passwordRecoverySchema,
  registerSchema,
  smsCodeSchema
} from "@/server/validators/auth.validator";

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

type RegisterInput = {
  login: string;
  password: string;
  phone: string;
  email?: string;
};

type LoginInput = {
  login: string;
  password: string;
};

function loginTarget(value: string) {
  const target = value.trim().toLowerCase();

  if (target.includes("@")) {
    return target;
  }

  return normalizePhone(target);
}

async function findUserForLogin(value: string) {
  const target = value.trim();

  return prisma.user.findFirst({
    where: {
      OR: [
        {
          login: target
        },
        {
          phone: normalizePhone(target)
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
    throw new Error("Слишком много неправильных попыток. Попробуйте через 30 минут.");
  }
}

export async function requestPhoneVerification(userId: string, meta?: RequestMeta) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  const since = addMinutes(new Date(), -SMS_WINDOW_MINUTES);
  const recentCodes = await prisma.smsCode.count({
    where: {
      purpose: "phone_verification",
      OR: meta?.ipAddress
        ? [
            {
              phone: user.phone,
              createdAt: {
                gte: since
              }
            },
            {
              ipAddress: meta.ipAddress,
              createdAt: {
                gte: since
              }
            }
          ]
        : [
            {
              phone: user.phone,
              createdAt: {
                gte: since
              }
            }
          ]
    }
  });

  if (recentCodes >= MAX_SMS_PER_WINDOW) {
    throw new Error("Слишком много SMS-кодов. Попробуйте позже.");
  }

  const code = createNumericCode();

  await prisma.smsCode.create({
    data: {
      userId: user.id,
      phone: user.phone,
      codeHash: hashCode(code),
      purpose: "phone_verification",
      ipAddress: meta?.ipAddress,
      expiresAt: addMinutes(new Date(), SMS_CODE_TTL_MINUTES)
    }
  });

  const result = await sendSmsCode({
    phone: user.phone,
    code,
    purpose: "phone_verification"
  });

  await writeSecurityLog({
    action: "phone_verification_sent",
    userId: user.id,
    ipAddress: meta?.ipAddress
  });

  return result;
}

export async function registerUser(input: RegisterInput, meta?: RequestMeta) {
  const data = registerSchema.parse({
    ...input,
    login: input.login.trim(),
    phone: normalizePhone(input.phone)
  });

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        {
          login: data.login
        },
        {
          phone: data.phone
        },
        ...(data.email
          ? [
              {
                email: data.email
              }
            ]
          : [])
      ]
    }
  });

  if (existingUser) {
    throw new Error("Пользователь с такими данными уже существует");
  }

  const user = await prisma.user.create({
    data: {
      login: data.login,
      passwordHash: hashPassword(data.password),
      phone: data.phone,
      email: data.email,
      emailUsableForRecovery: Boolean(data.email)
    }
  });

  const sms = await requestPhoneVerification(user.id, meta);

  return {
    user,
    sms
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

  const sms = user.phoneVerified
    ? undefined
    : await requestPhoneVerification(user.id, meta);

  return {
    user,
    sms
  };
}

export async function verifyPhone(userId: string, input: { phone: string; code: string }, meta?: RequestMeta) {
  const data = smsCodeSchema.parse(input);
  const phone = normalizePhone(data.phone);

  const code = await prisma.smsCode.findFirst({
    where: {
      userId,
      phone,
      purpose: "phone_verification",
      consumedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const isValidCode = isSmsProviderConfigured()
    ? await verifySmsCode({
        phone,
        code: data.code
      })
    : Boolean(code && verifyCode(data.code, code.codeHash));

  if (!code || !isValidCode) {
    if (code) {
      await prisma.smsCode.update({
        where: {
          id: code.id
        },
        data: {
          attempts: {
            increment: 1
          }
        }
      });
    }

    throw new Error("Неверный код подтверждения");
  }

  await prisma.$transaction([
    prisma.smsCode.update({
      where: {
        id: code.id
      },
      data: {
        consumedAt: new Date()
      }
    }),
    prisma.user.update({
      where: {
        id: userId
      },
      data: {
        phoneVerified: true
      }
    })
  ]);

  await writeSecurityLog({
    action: "phone_verified",
    userId,
    ipAddress: meta?.ipAddress
  });
}

export async function requestPasswordRecovery(targetInput: string, meta?: RequestMeta) {
  const target = targetInput.trim();

  if (!target) {
    throw new Error("Укажите телефон, email или логин");
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        {
          login: target
        },
        {
          phone: normalizePhone(target)
        },
        {
          email: target
        }
      ]
    }
  });

  if (!user) {
    throw new Error("Если аккаунт найден, код восстановления будет создан");
  }

  const isEmailTarget = user.email === target;

  if (isEmailTarget && !user.emailUsableForRecovery) {
    throw new Error("Этот email нельзя использовать для восстановления");
  }

  const code = createNumericCode();
  const channel = isEmailTarget ? "email" : "sms";

  await prisma.passwordRecoveryCode.create({
    data: {
      userId: user.id,
      channel,
      target,
      codeHash: hashCode(code),
      expiresAt: addMinutes(new Date(), PASSWORD_RECOVERY_CODE_TTL_MINUTES)
    }
  });

  const smsResult =
    channel === "sms"
      ? await sendSmsCode({
          phone: user.phone,
          code,
          purpose: "password_recovery"
        })
      : undefined;

  await writeSecurityLog({
    action: "password_recovery",
    userId: user.id,
    ipAddress: meta?.ipAddress,
    metadata: {
      channel
    }
  });

  return {
    developmentCode:
      smsResult?.developmentCode ??
      (channel === "email" && process.env.NODE_ENV === "development"
        ? code
        : undefined)
  };
}

export async function resetPassword(input: {
  target: string;
  code: string;
  newPassword: string;
}) {
  const data = passwordRecoverySchema.parse(input);
  const target = data.target.trim();

  const recoveryCode = await prisma.passwordRecoveryCode.findFirst({
    where: {
      target,
      consumedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (!recoveryCode || recoveryCode.attempts >= 3) {
    throw new Error("Код восстановления недействителен");
  }

  const recoverySmsUser =
    recoveryCode.userId &&
    recoveryCode.channel === "sms" &&
    isSmsProviderConfigured()
      ? await prisma.user.findUnique({
          where: {
            id: recoveryCode.userId
          },
          select: {
            phone: true
          }
        })
      : undefined;

  const isVerifiedBySms = recoverySmsUser
    ? await verifySmsCode({
        phone: recoverySmsUser.phone,
        code: data.code
      })
    : false;

  const isValidRecoveryCode = recoverySmsUser
    ? isVerifiedBySms
    : verifyCode(data.code, recoveryCode.codeHash);

  if (!isValidRecoveryCode) {
    await prisma.passwordRecoveryCode.update({
      where: {
        id: recoveryCode.id
      },
      data: {
        attempts: {
          increment: 1
        }
      }
    });

    throw new Error("Неверный код восстановления");
  }

  if (!recoveryCode.userId) {
    throw new Error("Аккаунт не найден");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: recoveryCode.userId
    },
    select: {
      login: true,
      phone: true,
      email: true
    }
  });

  if (!user) {
    throw new Error("Аккаунт не найден");
  }

  const loginAttemptTargets = Array.from(
    new Set(
      [target, user.login, user.phone, user.email]
        .filter((value): value is string => Boolean(value))
        .map(loginTarget)
    )
  );

  await prisma.$transaction([
    prisma.passwordRecoveryCode.update({
      where: {
        id: recoveryCode.id
      },
      data: {
        consumedAt: new Date()
      }
    }),
    prisma.user.update({
      where: {
        id: recoveryCode.userId
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
            userId: recoveryCode.userId
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
}
