import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError, type ZodIssue } from "zod";
import { findUserBySessionToken, getCurrentUser } from "@/server/auth/session";

export function sessionTokenFromAuthorization(authorization: string | null) {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function getBearerSessionToken() {
  const headerStore = await headers();

  return sessionTokenFromAuthorization(headerStore.get("authorization"));
}

export async function requireApiUser() {
  const bearerToken = await getBearerSessionToken();
  const user = bearerToken ? await findUserBySessionToken(bearerToken) : await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          ok: false,
          message: "Нужно войти в аккаунт"
        },
        { status: 401 }
      )
    };
  }

  return {
    user,
    response: null
  };
}

export function apiError(error: unknown, status = 400) {
  const message = error instanceof ZodError
    ? validationErrorMessage(error)
    : isPrismaError(error)
      ? "Не удалось выполнить действие. Попробуйте еще раз."
    : error instanceof Error
      ? error.message
      : "Ошибка запроса";

  if (isPrismaError(error)) {
    console.error(error);
  }

  return NextResponse.json(
    {
      ok: false,
      message
    },
    { status }
  );
}

function isPrismaError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  );
}

const validationFieldLabels: Record<string, string> = {
  amount: "Сумма",
  confirmPassword: "Подтверждение пароля",
  currency: "Валюта",
  currentEmail: "Текущий email",
  currentPassword: "Текущий пароль",
  email: "Email",
  firstName: "Имя",
  lastName: "Фамилия",
  login: "Логин",
  newEmail: "Новый email",
  newPassword: "Новый пароль",
  password: "Пароль",
  phone: "Телефон",
  rate: "Курс",
  "receiver.firstName": "Имя получателя",
  "receiver.lastName": "Фамилия получателя",
  "receiver.phone": "Телефон получателя",
  "sender.firstName": "Имя отправителя",
  "sender.lastName": "Фамилия отправителя",
  "sender.phone": "Телефон отправителя",
  secretAnswer: "Секретный ответ",
  secretQuestion: "Секретный вопрос",
  target: "Логин",
  whatsapp: "WhatsApp"
};

function charWord(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return "символ";
  }

  if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return "символа";
  }

  return "символов";
}

function validationFieldLabel(issue: ZodIssue) {
  const path = issue.path.join(".");
  const lastPathItem = issue.path[issue.path.length - 1];

  return (
    validationFieldLabels[path] ??
    validationFieldLabels[String(lastPathItem ?? "")] ??
    "Поле"
  );
}

function validationIssueMessage(issue: ZodIssue) {
  const label = validationFieldLabel(issue);

  if (issue.code === "custom" && issue.message) {
    return issue.message;
  }

  if (issue.code === "too_small") {
    const minimum = "minimum" in issue ? issue.minimum : undefined;

    if (typeof minimum === "number") {
      if (minimum <= 1) {
        return `${label}: заполните поле`;
      }

      return `${label}: минимум ${minimum} ${charWord(minimum)}`;
    }

    return `${label}: значение слишком короткое`;
  }

  if (issue.code === "invalid_format") {
    return `${label}: неверный формат`;
  }

  if (issue.code === "invalid_type") {
    return `${label}: укажите значение`;
  }

  if (issue.code === "invalid_value") {
    return `${label}: выберите значение из списка`;
  }

  return `${label}: проверьте значение`;
}

function validationErrorMessage(error: ZodError) {
  return Array.from(new Set(error.issues.map(validationIssueMessage))).join("\n");
}
