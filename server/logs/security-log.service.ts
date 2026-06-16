import { prisma } from "@/server/db/prisma";

export type SecurityLogAction =
  | "login"
  | "login_failed"
  | "register"
  | "phone_verified"
  | "phone_verification_sent"
  | "password_recovery"
  | "password_recovery_failed"
  | "password_reset"
  | "contact_created"
  | "contact_updated"
  | "contact_deleted"
  | "record_created"
  | "record_updated"
  | "record_deleted"
  | "record_favorite_added"
  | "record_favorite_removed"
  | "record_restored"
  | "account_delete_failed"
  | "account_deleted"
  | "account_updated"
  | "sensitive_data_viewed";

export async function writeSecurityLog(input: {
  action: SecurityLogAction;
  userId?: string;
  ipAddress?: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await prisma.securityLog.create({
    data: {
      action: input.action,
      userId: input.userId,
      ipAddress: input.ipAddress,
      metadata: input.metadata
    }
  });
}
