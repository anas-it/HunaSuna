import { ARCHIVE_BATCH_SIZE } from "@/lib/constants";
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
          data: JSON.parse(JSON.stringify(record))
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
