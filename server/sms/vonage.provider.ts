export async function sendVonageVerifyCode(phone: string) {
  return {
    phone,
    delivered: Boolean(process.env.VONAGE_API_KEY)
  };
}
