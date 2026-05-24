import { ARCHIVE_RETENTION_MONTHS } from "@/lib/constants";
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
    }
  });

  for (const record of expiredRecords) {
    await prisma.$transaction([
      prisma.archivedRecord.create({
        data: {
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
    archivedCount: expiredRecords.length
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
