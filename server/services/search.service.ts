import { listRecordsPage } from "@/server/services/record.service";

export async function searchRecords(
  userId: string,
  filters: {
    limit?: number | string | null;
    page?: number | string | null;
    query?: string;
    contactId?: string;
    phone?: string;
  }
) {
  return listRecordsPage(userId, filters);
}
