"use server";

import { redirect } from "next/navigation";
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

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function errorMessage(error: unknown) {
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
    await resetPassword({
      target: text(formData, "target"),
      secretAnswer: text(formData, "secretAnswer"),
      newPassword: text(formData, "newPassword"),
      confirmPassword: text(formData, "confirmPassword")
    });
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
      meta.timezone,
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
      meta.timezone,
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
        email: optionalText(formData, "email"),
        phone: optionalText(formData, "phone"),
        newPassword: optionalText(formData, "newPassword")
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
