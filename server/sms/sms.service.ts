export type SendSmsCodeInput = {
  phone: string;
  code: string;
  purpose: string;
};

export async function sendSmsCode(input: SendSmsCodeInput) {
  const isDevelopment = process.env.NODE_ENV === "development";
  const hasTwilio =
    Boolean(process.env.TWILIO_ACCOUNT_SID) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN) &&
    Boolean(process.env.TWILIO_VERIFY_SERVICE_SID);

  if (!hasTwilio) {
    return {
      delivered: false,
      developmentCode: isDevelopment ? input.code : undefined
    };
  }

  return {
    delivered: true,
    developmentCode: undefined
  };
}
