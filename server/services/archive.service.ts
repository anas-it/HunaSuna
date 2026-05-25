import { ARCHIVE_BATCH_SIZE, ARCHIVE_RETENTION_MONTHS } from "@/lib/constants";
import { addMonths } from "@/lib/date";
import { prisma } from "@/server/db/prisma";

export async function archiveExpiredDeletedRecords() {
  const now = new Date();
  const expiredRecords = await prisma.record.findMany({
    where: {
      deletedAt: {
        not: null
      },
      restoreUntil: {
        lte: now
      },
      archivedAt: null
    },
    orderBy: {
      restoreUntil: "asc"
    },
    take: ARCHIVE_BATCH_SIZE
  });

  for (const record of expiredRecords) {
    await prisma.$transaction([
      prisma.archivedRecord.upsert({
        where: {
          originalRecordId: record.id
        },
        update: {},
        create: {
          userId: record.userId,
          originalRecordId: record.id,
          data: JSON.parse(JSON.stringify(record)),
          deleteAfter: addMonths(now, ARCHIVE_RETENTION_MONTHS)
        }
      }),
      prisma.record.update({
        where: {
          id: record.id
        },
        data: {
          archivedAt: now
        }
      })
    ]);
  }

  return {
    archivedCount: expiredRecords.length,
    hasMore: expiredRecords.length === ARCHIVE_BATCH_SIZE
  };
}

export async function cleanupArchivedRecords() {
  const result = await prisma.archivedRecord.deleteMany({
    where: {
      deleteAfter: {
        lte: new Date()
      }
    }
  });

  return {
    deletedCount: result.count
  };
}
