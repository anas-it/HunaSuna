import {
  DELETED_RECORDS_PAGE_SIZE,
  MAX_RECORDS_PAGE_SIZE
} from "@/lib/constants";
import {
  createPaginationMeta,
  resolvePagination,
  type PaginationInput
} from "@/lib/pagination";
import { prisma } from "@/server/db/prisma";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import { recordListSelect } from "@/server/services/record.service";

function deletedRecordsWhere(userId: string) {
  return {
    userId,
    deletedAt: {
      not: null
    },
    restoreUntil: {
      gt: new Date()
    },
    archivedAt: null
  };
}

export async function listDeletedRecords(
  userId: string,
  options?: PaginationInput
) {
  const pagination = resolvePagination(
    options,
    DELETED_RECORDS_PAGE_SIZE,
    MAX_RECORDS_PAGE_SIZE
  );

  return prisma.record.findMany({
    where: deletedRecordsWhere(userId),
    select: recordListSelect,
    orderBy: {
      deletedAt: "desc"
    },
    skip: pagination.skip,
    take: pagination.limit
  });
}

export async function listDeletedRecordsPage(
  userId: string,
  options?: PaginationInput
) {
  const pagination = resolvePagination(
    options,
    DELETED_RECORDS_PAGE_SIZE,
    MAX_RECORDS_PAGE_SIZE
  );
  const where = deletedRecordsWhere(userId);
  const [records, total] = await prisma.$transaction([
    prisma.record.findMany({
      where,
      select: recordListSelect,
      orderBy: {
        deletedAt: "desc"
      },
      skip: pagination.skip,
      take: pagination.limit
    }),
    prisma.record.count({
      where
    })
  ]);

  return {
    records,
    pagination: createPaginationMeta(pagination, total)
  };
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
