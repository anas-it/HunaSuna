import { DASHBOARD_LATEST_RECORDS_LIMIT } from "@/lib/constants";
import { prisma } from "@/server/db/prisma";
import { recordListSelect } from "@/server/services/record.service";

export async function getDashboardSummary(userId: string) {
  const [contactsCount, recordsCount, deletedCount, latestRecords] =
    await prisma.$transaction([
      prisma.contact.count({
        where: {
          userId,
          deletedAt: null
        }
      }),
      prisma.record.count({
        where: {
          userId,
          deletedAt: null,
          archivedAt: null
        }
      }),
      prisma.record.count({
        where: {
          userId,
          deletedAt: {
            not: null
          },
          restoreUntil: {
            gt: new Date()
          },
          archivedAt: null
        }
      }),
      prisma.record.findMany({
        where: {
          userId,
          deletedAt: null,
          archivedAt: null
        },
        select: recordListSelect,
        orderBy: {
          createdAt: "desc"
        },
        take: DASHBOARD_LATEST_RECORDS_LIMIT
      })
    ]);

  return {
    contactsCount,
    deletedCount,
    latestRecords,
    recordsCount
  };
}
