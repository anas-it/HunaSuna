import twilio from "twilio";

function twilioConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();

  if (!accountSid || !authToken || !serviceSid) {
    return undefined;
  }

  return {
    accountSid,
    authToken,
    serviceSid
  };
}

export function isTwilioVerifyConfigured() {
  return Boolean(twilioConfig());
}

function twilioVerifyClient() {
  const config = twilioConfig();

  if (!config) {
    throw new Error("Twilio Verify is not configured");
  }

  return {
    client: twilio(config.accountSid, config.authToken),
    serviceSid: config.serviceSid
  };
}

export async function sendTwilioVerifyCode(phone: string) {
  const { client, serviceSid } = twilioVerifyClient();
  const verification = await client.verify.v2
    .services(serviceSid)
    .verifications.create({
      to: phone,
      channel: "sms"
    });

  return {
    phone,
    delivered:
      verification.status === "pending" || verification.status === "approved",
    status: verification.status
  };
}

export async function checkTwilioVerifyCode(phone: string, code: string) {
  const { client, serviceSid } = twilioVerifyClient();
  const verificationCheck = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({
      to: phone,
      code
    });

  return verificationCheck.status === "approved" || verificationCheck.valid;
}
