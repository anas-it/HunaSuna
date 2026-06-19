import { archiveExpiredDeletedRecords } from "@/server/services/archive.service";

export async function archiveExpiredDeletedRecordsJob() {
  return archiveExpiredDeletedRecords();
}
