import { prisma } from "@/server/db/prisma";
import { writeSecurityLog } from "@/server/logs/security-log.service";

export async function listDeletedRecords(userId: string) {
  return prisma.record.findMany({
    where: {
      userId,
      deletedAt: {
        not: null
      },
      restoreUntil: {
        gt: new Date()
      },
      archivedAt: null
    },
    orderBy: {
      deletedAt: "desc"
    }
  });
}

export async function restoreDeletedRecord(
  userId: string,
  recordId: string,
  meta?: { ipAddress?: string }
) {
  const record = await prisma.record.findFirst({
    where: {
      id: recordId,
      userId,
      deletedAt: {
        not: null
      },
      restoreUntil: {
        gt: new Date()
      },
      archivedAt: null
    }
  });

  if (!record) {
    throw new Error("Удаленная запись не найдена или срок восстановления прошел");
  }

  const restoredRecord = await prisma.record.update({
    where: {
      id: recordId
    },
    data: {
      deletedAt: null,
      restoreUntil: null
    }
  });

  await writeSecurityLog({
    action: "record_restored",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      recordId
    }
  });

  return restoredRecord;
}
