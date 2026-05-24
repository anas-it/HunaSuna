export type SendSmsCodeInput = {
  phone: string;
  code: string;
  purpose: string;
};

export async function sendSmsCode(input: SendSmsCodeInput) {
  const hasTwilio =
    Boolean(process.env.TWILIO_ACCOUNT_SID) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN) &&
    Boolean(process.env.TWILIO_VERIFY_SERVICE_SID);

  if (!hasTwilio) {
    return {
      delivered: false,
      developmentCode: input.code
    };
  }

  return {
    delivered: true,
    developmentCode: undefined
  };
}
