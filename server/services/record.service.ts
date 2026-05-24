import { Prisma } from "@prisma/client";
import { DELETED_RECORD_RESTORE_DAYS } from "@/lib/constants";
import { addDays, endOfDay, startOfDay } from "@/lib/date";
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
  query?: string;
  contactId?: string;
  date?: string;
  phone?: string;
};

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
      phone: contact.phone
    };
  }

  const firstName = person.firstName?.trim();
  const lastName = person.lastName?.trim();

  if (!firstName || !lastName) {
    throw new Error("Для ручного ввода укажите имя и фамилию");
  }

  return {
    contactId: null,
    firstName,
    lastName,
    phone: person.phone?.trim() || null
  };
}

function searchWhere(filters?: RecordFilters): Prisma.RecordWhereInput[] {
  const and: Prisma.RecordWhereInput[] = [];

  if (filters?.query) {
    const query = filters.query.trim();

    if (query) {
      and.push({
        OR: [
          {
            senderFirstNameSnapshot: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            senderLastNameSnapshot: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            receiverFirstNameSnapshot: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            receiverLastNameSnapshot: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            senderPhoneSnapshot: {
              contains: query
            }
          },
          {
            receiverPhoneSnapshot: {
              contains: query
            }
          }
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

    if (phone) {
      and.push({
        OR: [
          {
            senderPhoneSnapshot: {
              contains: phone
            }
          },
          {
            receiverPhoneSnapshot: {
              contains: phone
            }
          }
        ]
      });
    }
  }

  if (filters?.date) {
    and.push({
      createdAt: {
        gte: startOfDay(filters.date),
        lte: endOfDay(filters.date)
      }
    });
  }

  return and;
}

export async function listRecords(userId: string, filters?: RecordFilters) {
  const and = searchWhere(filters);

  return prisma.record.findMany({
    where: {
      userId,
      deletedAt: null,
      archivedAt: null,
      ...(and.length ? { AND: and } : {})
    },
    orderBy: {
      createdAt: "desc"
    }
  });
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
      receiverContactId: receiver.contactId,
      receiverFirstNameSnapshot: receiver.firstName,
      receiverLastNameSnapshot: receiver.lastName,
      receiverPhoneSnapshot: receiver.phone,
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
      receiverContactId: receiver.contactId,
      receiverFirstNameSnapshot: receiver.firstName,
      receiverLastNameSnapshot: receiver.lastName,
      receiverPhoneSnapshot: receiver.phone,
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
