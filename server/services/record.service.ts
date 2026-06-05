import { Prisma } from "@prisma/client";
import {
  DELETED_RECORD_RESTORE_DAYS,
  MAX_RECORDS_PAGE_SIZE,
  RECORDS_PAGE_SIZE
} from "@/lib/constants";
import { addDays } from "@/lib/date";
import {
  createPaginationMeta,
  resolvePagination
} from "@/lib/pagination";
import { normalizePhoneForSearch } from "@/lib/phone";
import { prisma } from "@/server/db/prisma";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import { recordSchema } from "@/server/validators/record.validator";

type PersonInput = {
  contactId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type RecordInput = {
  sender: PersonInput;
  receiver: PersonInput;
  amount: string;
  currency: string;
  rate: string;
};

type RecordFilters = {
  limit?: number | string | null;
  page?: number | string | null;
  query?: string;
  contactId?: string;
  phone?: string;
};

function namePairConditions(
  firstNameField: "senderFirstNameSnapshot" | "receiverFirstNameSnapshot",
  lastNameField: "senderLastNameSnapshot" | "receiverLastNameSnapshot",
  query: string
) {
  const parts = query.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return [];
  }

  const firstPart = parts[0];
  const secondPart = parts.slice(1).join(" ");

  return [
    {
      AND: [
        {
          [firstNameField]: {
            startsWith: firstPart,
            mode: "insensitive" as const
          }
        },
        {
          [lastNameField]: {
            startsWith: secondPart,
            mode: "insensitive" as const
          }
        }
      ]
    },
    {
      AND: [
        {
          [firstNameField]: {
            startsWith: secondPart,
            mode: "insensitive" as const
          }
        },
        {
          [lastNameField]: {
            startsWith: firstPart,
            mode: "insensitive" as const
          }
        }
      ]
    }
  ] satisfies Prisma.RecordWhereInput[];
}

export const recordListSelect = {
  id: true,
  createdAt: true,
  senderFirstNameSnapshot: true,
  senderLastNameSnapshot: true,
  senderPhoneSnapshot: true,
  receiverFirstNameSnapshot: true,
  receiverLastNameSnapshot: true,
  receiverPhoneSnapshot: true,
  amount: true,
  currency: true,
  rate: true,
  timezone: true,
  restoreUntil: true
} satisfies Prisma.RecordSelect;

export type RecordListItem = Prisma.RecordGetPayload<{
  select: typeof recordListSelect;
}>;

async function resolvePerson(userId: string, person: PersonInput) {
  if (person.contactId && person.contactId !== "manual") {
    const contact = await prisma.contact.findFirst({
      where: {
        id: person.contactId,
        userId,
        deletedAt: null
      }
    });

    if (!contact) {
      throw new Error("Выбранный контакт не найден");
    }

    return {
      contactId: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      phoneSearch: normalizePhoneForSearch(contact.phone) || null
    };
  }

  const firstName = person.firstName?.trim();
  const lastName = person.lastName?.trim();

  if (!firstName || !lastName) {
    throw new Error("Для ручного ввода укажите имя и фамилию");
  }

  const phone = person.phone?.trim() || null;

  return {
    contactId: null,
    firstName,
    lastName,
    phone,
    phoneSearch: phone ? normalizePhoneForSearch(phone) || null : null
  };
}

function searchWhere(filters?: RecordFilters): Prisma.RecordWhereInput[] {
  const and: Prisma.RecordWhereInput[] = [];

  if (filters?.query) {
    const query = filters.query.trim();
    const phoneQuery = normalizePhoneForSearch(query);

    if (query) {
      and.push({
        OR: [
          {
            senderFirstNameSnapshot: {
              startsWith: query,
              mode: "insensitive"
            }
          },
          {
            senderLastNameSnapshot: {
              startsWith: query,
              mode: "insensitive"
            }
          },
          {
            receiverFirstNameSnapshot: {
              startsWith: query,
              mode: "insensitive"
            }
          },
          {
            receiverLastNameSnapshot: {
              startsWith: query,
              mode: "insensitive"
            }
          },
          {
            senderPhoneSnapshot: {
              startsWith: query
            }
          },
          {
            receiverPhoneSnapshot: {
              startsWith: query
            }
          },
          ...namePairConditions("senderFirstNameSnapshot", "senderLastNameSnapshot", query),
          ...namePairConditions("receiverFirstNameSnapshot", "receiverLastNameSnapshot", query),
          ...(phoneQuery
            ? [
                {
                  senderPhoneSearch: {
                    startsWith: phoneQuery
                  }
                },
                {
                  receiverPhoneSearch: {
                    startsWith: phoneQuery
                  }
                }
              ]
            : [])
        ]
      });
    }
  }

  if (filters?.contactId) {
    and.push({
      OR: [
        {
          senderContactId: filters.contactId
        },
        {
          receiverContactId: filters.contactId
        }
      ]
    });
  }

  if (filters?.phone) {
    const phone = filters.phone.trim();
    const phoneQuery = normalizePhoneForSearch(phone);

    if (phone) {
      and.push({
        OR: [
          {
            senderPhoneSnapshot: {
              startsWith: phone
            }
          },
          {
            receiverPhoneSnapshot: {
              startsWith: phone
            }
          },
          ...(phoneQuery
            ? [
                {
                  senderPhoneSearch: {
                    startsWith: phoneQuery
                  }
                },
                {
                  receiverPhoneSearch: {
                    startsWith: phoneQuery
                  }
                }
              ]
            : [])
        ]
      });
    }
  }

  return and;
}

export async function listRecords(userId: string, filters?: RecordFilters) {
  const and = searchWhere(filters);
  const pagination = resolvePagination(
    filters,
    RECORDS_PAGE_SIZE,
    MAX_RECORDS_PAGE_SIZE
  );

  return prisma.record.findMany({
    where: {
      userId,
      deletedAt: null,
      archivedAt: null,
      ...(and.length ? { AND: and } : {})
    },
    select: recordListSelect,
    orderBy: {
      createdAt: "desc"
    },
    skip: pagination.skip,
    take: pagination.limit
  });
}

export async function listRecordsPage(userId: string, filters?: RecordFilters) {
  const and = searchWhere(filters);
  const pagination = resolvePagination(
    filters,
    RECORDS_PAGE_SIZE,
    MAX_RECORDS_PAGE_SIZE
  );
  const where: Prisma.RecordWhereInput = {
    userId,
    deletedAt: null,
    archivedAt: null,
    ...(and.length ? { AND: and } : {})
  };
  const [records, total] = await prisma.$transaction([
    prisma.record.findMany({
      where,
      select: recordListSelect,
      orderBy: {
        createdAt: "desc"
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

export async function getRecord(userId: string, recordId: string) {
  const record = await prisma.record.findFirst({
    where: {
      id: recordId,
      userId,
      archivedAt: null
    }
  });

  if (!record) {
    throw new Error("Запись не найдена");
  }

  return record;
}

export async function createRecord(
  userId: string,
  input: RecordInput,
  timezone: string,
  meta?: { ipAddress?: string }
) {
  const data = recordSchema.parse(input);
  const sender = await resolvePerson(userId, data.sender);
  const receiver = await resolvePerson(userId, data.receiver);

  const record = await prisma.record.create({
    data: {
      userId,
      senderContactId: sender.contactId,
      senderFirstNameSnapshot: sender.firstName,
      senderLastNameSnapshot: sender.lastName,
      senderPhoneSnapshot: sender.phone,
      senderPhoneSearch: sender.phoneSearch,
      receiverContactId: receiver.contactId,
      receiverFirstNameSnapshot: receiver.firstName,
      receiverLastNameSnapshot: receiver.lastName,
      receiverPhoneSnapshot: receiver.phone,
      receiverPhoneSearch: receiver.phoneSearch,
      amount: data.amount.trim(),
      currency: data.currency,
      rate: data.rate.trim(),
      timezone
    }
  });

  await writeSecurityLog({
    action: "record_created",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      recordId: record.id
    }
  });

  return record;
}

export async function updateRecord(
  userId: string,
  recordId: string,
  input: RecordInput,
  timezone: string,
  meta?: { ipAddress?: string }
) {
  const existingRecord = await getRecord(userId, recordId);

  if (existingRecord.deletedAt) {
    throw new Error("Удаленную запись нельзя редактировать");
  }

  const data = recordSchema.parse(input);
  const sender = await resolvePerson(userId, data.sender);
  const receiver = await resolvePerson(userId, data.receiver);

  const record = await prisma.record.update({
    where: {
      id: recordId
    },
    data: {
      senderContactId: sender.contactId,
      senderFirstNameSnapshot: sender.firstName,
      senderLastNameSnapshot: sender.lastName,
      senderPhoneSnapshot: sender.phone,
      senderPhoneSearch: sender.phoneSearch,
      receiverContactId: receiver.contactId,
      receiverFirstNameSnapshot: receiver.firstName,
      receiverLastNameSnapshot: receiver.lastName,
      receiverPhoneSnapshot: receiver.phone,
      receiverPhoneSearch: receiver.phoneSearch,
      amount: data.amount.trim(),
      currency: data.currency,
      rate: data.rate.trim(),
      timezone
    }
  });

  await writeSecurityLog({
    action: "record_updated",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      recordId
    }
  });

  return record;
}

export async function deleteRecord(
  userId: string,
  recordId: string,
  meta?: { ipAddress?: string }
) {
  const existingRecord = await getRecord(userId, recordId);

  if (existingRecord.deletedAt) {
    return existingRecord;
  }

  const now = new Date();
  const record = await prisma.record.update({
    where: {
      id: recordId
    },
    data: {
      deletedAt: now,
      restoreUntil: addDays(now, DELETED_RECORD_RESTORE_DAYS)
    }
  });

  await writeSecurityLog({
    action: "record_deleted",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      recordId
    }
  });

  return record;
}
