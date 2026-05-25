"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRequestMeta } from "@/server/auth/request";
import {
  createSession,
  destroyCurrentSession,
  requirePageSessionUser,
  requirePageUser
} from "@/server/auth/session";
import {
  loginUser,
  registerUser,
  requestPasswordRecovery,
  requestPhoneVerification,
  resetPassword,
  verifyPhone
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

const DEV_SMS_COOKIE = "hunasuna_dev_sms_code";
const DEV_RECOVERY_COOKIE = "hunasuna_dev_recovery_code";

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
  return `${path}?error=${encodeURIComponent(errorMessage(error))}`;
}

async function storeDevelopmentCode(code?: string) {
  const cookieStore = await cookies();

  if (!code) {
    cookieStore.set(DEV_SMS_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/verify-phone"
    });
    return;
  }

  cookieStore.set(DEV_SMS_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/verify-phone"
  });
}

async function storeRecoveryCode(code?: string) {
  const cookieStore = await cookies();

  if (!code) {
    cookieStore.set(DEV_RECOVERY_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/forgot-password"
    });
    return;
  }

  cookieStore.set(DEV_RECOVERY_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/forgot-password"
  });
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
  let nextPath = "/verify-phone";

  try {
    const meta = await getRequestMeta();
    const result = await registerUser(
      {
        login: text(formData, "login"),
        password: text(formData, "password"),
        phone: text(formData, "phone"),
        email: optionalText(formData, "email")
      },
      meta
    );

    await createSession(result.user.id, meta);
    await storeDevelopmentCode(result.sms.developmentCode);
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

    if (!result.user.phoneVerified) {
      await storeDevelopmentCode(result.sms?.developmentCode);
      nextPath = "/verify-phone";
    }
  } catch (error) {
    nextPath = withError("/login", error);
  }

  redirect(nextPath);
}

export async function verifyPhoneAction(formData: FormData) {
  let nextPath = "/dashboard";

  try {
    const user = await requirePageSessionUser();
    const meta = await getRequestMeta();

    await verifyPhone(
      user.id,
      {
        phone: user.phone,
        code: text(formData, "code")
      },
      meta
    );
    await storeDevelopmentCode();
  } catch (error) {
    nextPath = withError("/verify-phone", error);
  }

  redirect(nextPath);
}

export async function resendVerificationCodeAction() {
  let nextPath = "/verify-phone";

  try {
    const user = await requirePageSessionUser();
    const meta = await getRequestMeta();
    const result = await requestPhoneVerification(user.id, meta);
    await storeDevelopmentCode(result.developmentCode);
  } catch (error) {
    nextPath = withError("/verify-phone", error);
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
    await storeRecoveryCode(result.developmentCode);
    nextPath = `/forgot-password?step=reset&target=${encodeURIComponent(text(formData, "target"))}`;
  } catch (error) {
    await storeRecoveryCode();
    nextPath = withError("/forgot-password", error);
  }

  redirect(nextPath);
}

export async function resetPasswordAction(formData: FormData) {
  let nextPath = "/login";

  try {
    await resetPassword({
      target: text(formData, "target"),
      code: text(formData, "code"),
      newPassword: text(formData, "newPassword")
    });
    await storeRecoveryCode();
  } catch (error) {
    nextPath = withError(
      `/forgot-password?step=reset&target=${encodeURIComponent(text(formData, "target"))}`,
      error
    );
  }

  redirect(nextPath);
}

export async function createContactAction(formData: FormData) {
  let nextPath = "/contacts";

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
  let nextPath = `/contacts/${contactId}`;

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
  let nextPath = "/records";

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
  let nextPath = "/records";

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

export async function deleteRecordAction(recordId: string) {
  const user = await requirePageUser();
  const meta = await getRequestMeta();
  await deleteRecord(user.id, recordId, meta);
  redirect("/deleted");
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

    if (result.phoneChanged) {
      const sms = await requestPhoneVerification(user.id, meta);
      await storeDevelopmentCode(sms.developmentCode);
      nextPath = "/verify-phone";
    }
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
