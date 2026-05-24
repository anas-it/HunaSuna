export async function sendTwilioVerifyCode(phone: string) {
  return {
    phone,
    delivered: Boolean(process.env.TWILIO_ACCOUNT_SID)
  };
}
