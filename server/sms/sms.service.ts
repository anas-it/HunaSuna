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
    if (!isDevelopment) {
      throw new Error(
        "SMS-сервис не настроен. Проверьте переменные Twilio в Vercel."
      );
    }

    return {
      delivered: false,
      developmentCode: input.code
    };
  }

  try {
    const result = await sendTwilioVerifyCode(input.phone);

    if (!result.delivered) {
      throw new Error(`Twilio returned status: ${result.status}`);
    }
  } catch (error) {
    console.error("Twilio Verify SMS failed", error);

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
