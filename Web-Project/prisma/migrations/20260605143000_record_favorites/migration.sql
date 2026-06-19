ALTER TABLE "Record" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Record_user_favorite_active_date_idx"
  ON "Record"("userId", "isFavorite", "deletedAt", "archivedAt", "createdAt");
