import {
  checkTwilioVerifyCode,
  isTwilioVerifyConfigured,
  sendTwilioVerifyCode
} from "@/server/sms/twilio.provider";

export type SendSmsCodeInput = {
  phone: string;
  code: string;
  purpose: string;
};

export function isSmsProviderConfigured() {
  return isTwilioVerifyConfigured();
}

export async function sendSmsCode(input: SendSmsCodeInput) {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isTwilioVerifyConfigured()) {
    return {
      delivered: false,
      developmentCode: isDevelopment ? input.code : undefined
    };
  }

  try {
    await sendTwilioVerifyCode(input.phone);
  } catch {
    throw new Error(
      "Не удалось отправить SMS-код. Проверьте номер телефона и настройки Twilio."
    );
  }

  return {
    delivered: true,
    developmentCode: undefined
  };
}

export async function verifySmsCode(input: { phone: string; code: string }) {
  if (!isTwilioVerifyConfigured()) {
    return undefined;
  }

  try {
    return await checkTwilioVerifyCode(input.phone, input.code);
  } catch {
    return false;
  }
}
