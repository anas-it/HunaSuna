DROP INDEX IF EXISTS "ArchivedRecord_deleteAfter_idx";

ALTER TABLE "ArchivedRecord" DROP COLUMN IF EXISTS "deleteAfter";
