CREATE INDEX "Contact_user_active_name_idx" ON "Contact"("userId", "deletedAt", "firstName", "lastName");

CREATE INDEX "Record_user_active_date_idx" ON "Record"("userId", "deletedAt", "archivedAt", "createdAt");
CREATE INDEX "Record_user_sender_history_idx" ON "Record"("userId", "senderContactId", "deletedAt", "archivedAt", "createdAt");
CREATE INDEX "Record_user_receiver_history_idx" ON "Record"("userId", "receiverContactId", "deletedAt", "archivedAt", "createdAt");
CREATE INDEX "Record_archive_due_idx" ON "Record"("restoreUntil", "archivedAt");

DROP INDEX IF EXISTS "ArchivedRecord_originalRecordId_idx";
CREATE UNIQUE INDEX "ArchivedRecord_originalRecordId_key" ON "ArchivedRecord"("originalRecordId");
