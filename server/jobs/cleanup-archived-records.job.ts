import { cleanupArchivedRecords } from "@/server/services/archive.service";

export async function cleanupArchivedRecordsJob() {
  return cleanupArchivedRecords();
}
