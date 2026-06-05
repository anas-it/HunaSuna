"use server";

import { redirect } from "next/navigation";
import { ZodError, type ZodIssue } from "zod";
import { getRequestMeta } from "@/server/auth/request";
import {
  createSession,
  destroyCurrentSession,
  requirePageUser
} from "@/server/auth/session";
import {
  loginUser,
  registerUser,
  requestPasswordRecovery,
  resetPassword
} from "@/server/services/auth.service";
import {
  createContact,
  deleteContact,
  updateContact
} from "@/server/services/contact.service";
import { restoreDeletedRecord } from "@/server/services/deleted-record.service";
import {
  createRecord,
  deleteRecord,
  updateRecord
} from "@/server/services/record.service";
import {
  revealUserSensitiveData,
  updateUserEmail,
  updateUserPassword,
  updateUserProfile
} from "@/server/services/user.service";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? value : undefined;
}

function validTimezone(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  try {
    new Intl.DateTimeFormat("ru-RU", { timeZone: value }).format(new Date());
    return value;
  } catch {
    return fallback;
  }
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

const validationFieldLabels: Record<string, string> = {
  amount: "Сумма",
  confirmPassword: "Подтверждение пароля",
  contactId: "Контакт",
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
  const messages = error.issues.map(validationIssueMessage);
  const uniqueMessages = Array.from(new Set(messages));

  return uniqueMessages.join("\n");
}

function errorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return validationErrorMessage(error);
  }

  return error instanceof Error ? error.message : "Что-то пошло не так";
}

function withError(path: string, error: unknown) {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}error=${encodeURIComponent(errorMessage(error))}`;
}

function withMessage(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}message=${encodeURIComponent(message)}`;
}

function safeReturnPath(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }

  return path;
}

function personFromForm(formData: FormData, prefix: "sender" | "receiver") {
  const contactId = optionalText(formData, `${prefix}ContactId`);

  return {
    contactId,
    firstName: optionalText(formData, `${prefix}FirstName`),
    lastName: optionalText(formData, `${prefix}LastName`),
    phone: optionalText(formData, `${prefix}Phone`)
  };
}

export async function registerAction(formData: FormData) {
  let nextPath = "/dashboard";

  try {
    const meta = await getRequestMeta();
    const result = await registerUser(
      {
        login: text(formData, "login"),
        password: text(formData, "password"),
        confirmPassword: text(formData, "confirmPassword"),
        secretQuestion: text(formData, "secretQuestion"),
        secretAnswer: text(formData, "secretAnswer")
      },
      meta
    );

    await createSession(result.user.id, meta);
  } catch (error) {
    nextPath = withError("/register", error);
  }

  redirect(nextPath);
}

export async function loginAction(formData: FormData) {
  let nextPath = "/dashboard";

  try {
    const meta = await getRequestMeta();
    const result = await loginUser(
      {
        login: text(formData, "login"),
        password: text(formData, "password")
      },
      meta
    );

    await createSession(result.user.id, meta, {
      remember: checked(formData, "remember")
    });
  } catch (error) {
    nextPath = withError("/login", error);
  }

  redirect(nextPath);
}

export async function logoutAction() {
  await destroyCurrentSession();
  redirect("/login");
}

export async function requestPasswordRecoveryAction(formData: FormData) {
  let nextPath = "/forgot-password?step=reset";

  try {
    const meta = await getRequestMeta();
    const result = await requestPasswordRecovery(text(formData, "target"), meta);
    nextPath = `/forgot-password?step=reset&target=${encodeURIComponent(text(formData, "target"))}&question=${encodeURIComponent(result.secretQuestion)}`;
  } catch (error) {
    nextPath = withError("/forgot-password", error);
  }

  redirect(nextPath);
}

export async function resetPasswordAction(formData: FormData) {
  let nextPath = "/login";

  try {
    const meta = await getRequestMeta();
    await resetPassword(
      {
        target: text(formData, "target"),
        secretAnswer: text(formData, "secretAnswer"),
        newPassword: text(formData, "newPassword"),
        confirmPassword: text(formData, "confirmPassword")
      },
      meta
    );
  } catch (error) {
    nextPath = withError(
      `/forgot-password?step=reset&target=${encodeURIComponent(text(formData, "target"))}&question=${encodeURIComponent(text(formData, "secretQuestion"))}`,
      error
    );
  }

  redirect(nextPath);
}

export async function createContactAction(formData: FormData) {
  let nextPath = withMessage("/contacts", "Контакт добавлен");

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await createContact(
      user.id,
      {
        firstName: text(formData, "firstName"),
        lastName: text(formData, "lastName"),
        phone: text(formData, "phone"),
        whatsapp: optionalText(formData, "whatsapp")
      },
      meta
    );
  } catch (error) {
    nextPath = withError("/contacts", error);
  }

  redirect(nextPath);
}

export async function updateContactAction(contactId: string, formData: FormData) {
  let nextPath = withMessage(`/contacts/${contactId}`, "Контакт сохранен");

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await updateContact(
      user.id,
      contactId,
      {
        firstName: text(formData, "firstName"),
        lastName: text(formData, "lastName"),
        phone: text(formData, "phone"),
        whatsapp: optionalText(formData, "whatsapp")
      },
      meta
    );
  } catch (error) {
    nextPath = withError(`/contacts/${contactId}`, error);
  }

  redirect(nextPath);
}

export async function deleteContactAction(contactId: string) {
  const user = await requirePageUser();
  const meta = await getRequestMeta();
  await deleteContact(user.id, contactId, meta);
  redirect("/contacts");
}

export async function createRecordAction(formData: FormData) {
  let nextPath = withMessage("/records", "Запись добавлена");

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await createRecord(
      user.id,
      {
        sender: personFromForm(formData, "sender"),
        receiver: personFromForm(formData, "receiver"),
        amount: text(formData, "amount"),
        currency: text(formData, "currency"),
        rate: text(formData, "rate")
      },
      validTimezone(optionalText(formData, "timezone"), meta.timezone),
      meta
    );
  } catch (error) {
    nextPath = withError("/records/new", error);
  }

  redirect(nextPath);
}

export async function updateRecordAction(recordId: string, formData: FormData) {
  let nextPath = withMessage("/records", "Запись сохранена");

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await updateRecord(
      user.id,
      recordId,
      {
        sender: personFromForm(formData, "sender"),
        receiver: personFromForm(formData, "receiver"),
        amount: text(formData, "amount"),
        currency: text(formData, "currency"),
        rate: text(formData, "rate")
      },
      validTimezone(optionalText(formData, "timezone"), meta.timezone),
      meta
    );
  } catch (error) {
    nextPath = withError(`/records/${recordId}`, error);
  }

  redirect(nextPath);
}

export async function deleteRecordAction(recordId: string, formData: FormData) {
  const returnTo = safeReturnPath(formData.get("returnTo"), "/records");
  let nextPath = withMessage(returnTo, "Запись удалена");

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await deleteRecord(user.id, recordId, meta);
  } catch (error) {
    nextPath = withError(returnTo, error);
  }

  redirect(nextPath);
}

export async function restoreRecordAction(recordId: string) {
  const user = await requirePageUser();
  const meta = await getRequestMeta();
  await restoreDeletedRecord(user.id, recordId, meta);
  redirect("/deleted");
}

export async function updateSettingsAction(formData: FormData) {
  let nextPath = "/settings";

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    const result = await updateUserProfile(
      user.id,
      {
        firstName: optionalText(formData, "firstName"),
        lastName: optionalText(formData, "lastName"),
        phone: optionalText(formData, "phone")
      },
      meta
    );

    void result;
  } catch (error) {
    nextPath = withError("/settings", error);
  }

  redirect(nextPath);
}

export async function updatePasswordAction(formData: FormData) {
  let nextPath = "/settings";

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await updateUserPassword(
      user.id,
      {
        currentPassword: text(formData, "currentPassword"),
        newPassword: text(formData, "newPassword")
      },
      meta
    );
  } catch (error) {
    nextPath = withError("/settings", error);
  }

  redirect(nextPath);
}

export async function updateEmailAction(formData: FormData) {
  let nextPath = "/settings";

  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    await updateUserEmail(
      user.id,
      {
        currentEmail: optionalText(formData, "currentEmail"),
        newEmail: text(formData, "newEmail")
      },
      meta
    );
  } catch (error) {
    nextPath = withError("/settings", error);
  }

  redirect(nextPath);
}

export async function revealSensitiveSettingsAction(formData: FormData) {
  try {
    const user = await requirePageUser();
    const meta = await getRequestMeta();
    const data = await revealUserSensitiveData(
      user.id,
      text(formData, "currentPassword"),
      meta
    );

    return {
      ok: true as const,
      data
    };
  } catch (error) {
    return {
      ok: false as const,
      error: errorMessage(error)
    };
  }
}
