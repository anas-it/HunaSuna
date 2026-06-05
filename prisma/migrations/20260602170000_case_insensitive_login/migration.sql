ALTER TABLE "User" ADD COLUMN "loginNormalized" TEXT;

UPDATE "User" SET "loginNormalized" = lower("login");

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "User"
    GROUP BY "loginNormalized"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot create case-insensitive unique login index: duplicate normalized logins exist';
  END IF;
END $$;

ALTER TABLE "User" ALTER COLUMN "loginNormalized" SET NOT NULL;

CREATE UNIQUE INDEX "User_loginNormalized_key" ON "User"("loginNormalized");
