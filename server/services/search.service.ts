import { listRecords } from "@/server/services/record.service";

export async function searchRecords(
  userId: string,
  filters: {
    query?: string;
    contactId?: string;
    date?: string;
    phone?: string;
  }
) {
  return listRecords(userId, filters);
}
