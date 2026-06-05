DROP TABLE IF EXISTS "PasswordRecoveryCode";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailUsableForRecovery";
