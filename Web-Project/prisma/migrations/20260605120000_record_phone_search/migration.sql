ALTER TABLE "Record" ADD COLUMN "senderPhoneSearch" TEXT;
ALTER TABLE "Record" ADD COLUMN "receiverPhoneSearch" TEXT;

UPDATE "Record"
SET
  "senderPhoneSearch" = NULLIF(regexp_replace(COALESCE("senderPhoneSnapshot", ''), '[^0-9]+', '', 'g'), ''),
  "receiverPhoneSearch" = NULLIF(regexp_replace(COALESCE("receiverPhoneSnapshot", ''), '[^0-9]+', '', 'g'), '');

CREATE INDEX "Record_senderPhoneSearch_idx" ON "Record"("senderPhoneSearch");
CREATE INDEX "Record_receiverPhoneSearch_idx" ON "Record"("receiverPhoneSearch");
