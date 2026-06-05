import { prisma } from "@/server/db/prisma";
import {
  CONTACT_HISTORY_PAGE_SIZE,
  CONTACT_SELECT_LIMIT,
  CONTACTS_PAGE_SIZE,
  MAX_RECORDS_PAGE_SIZE,
  MAX_CONTACTS_PAGE_SIZE
} from "@/lib/constants";
import {
  createPaginationMeta,
  resolvePagination,
  type PaginationInput
} from "@/lib/pagination";
import { normalizePhone, normalizePhoneForSearch } from "@/lib/phone";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import { recordListSelect } from "@/server/services/record.service";
import { contactSchema } from "@/server/validators/contact.validator";

type ContactInput = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
};

type ContactFilters = PaginationInput & {
  query?: string | null;
};

export type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string | null;
};

const contactListSelect = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  whatsapp: true
} as const;

function activeContactsWhere(userId: string, filters?: ContactFilters) {
  const query = filters?.query?.trim();
  const phoneQuery = query ? normalizePhoneForSearch(query) : "";
  const phonePrefixConditions = phoneQuery
    ? [
        {
          phone: {
            startsWith: phoneQuery
          }
        },
        {
          phone: {
            startsWith: `+${phoneQuery}`
          }
        }
      ]
    : [];

  return {
    userId,
    deletedAt: null,
    ...(query
      ? {
          OR: [
            {
              firstName: {
                startsWith: query,
                mode: "insensitive" as const
              }
            },
            {
              lastName: {
                startsWith: query,
                mode: "insensitive" as const
              }
            },
            ...phonePrefixConditions
          ]
        }
      : {})
  };
}

export async function listContacts(
  userId: string,
  options?: ContactFilters
): Promise<ContactListItem[]> {
  const pagination = resolvePagination(
    {
      limit: options?.limit ?? CONTACT_SELECT_LIMIT,
      page: options?.page
    },
    CONTACT_SELECT_LIMIT,
    CONTACT_SELECT_LIMIT
  );

  return prisma.contact.findMany({
    where: activeContactsWhere(userId, options),
    select: contactListSelect,
    orderBy: [
      {
        firstName: "asc"
      },
      {
        lastName: "asc"
      }
    ],
    skip: pagination.skip,
    take: pagination.limit
  });
}

export async function listContactsPage(
  userId: string,
  options?: ContactFilters
) {
  const pagination = resolvePagination(
    options,
    CONTACTS_PAGE_SIZE,
    MAX_CONTACTS_PAGE_SIZE
  );
  const where = activeContactsWhere(userId, options);
  const [contacts, total] = await prisma.$transaction([
    prisma.contact.findMany({
      where,
      select: contactListSelect,
      orderBy: [
        {
          firstName: "asc"
        },
        {
          lastName: "asc"
        }
      ],
      skip: pagination.skip,
      take: pagination.limit
    }),
    prisma.contact.count({
      where
    })
  ]);

  return {
    contacts,
    pagination: createPaginationMeta(pagination, total)
  };
}

export async function getContact(userId: string, contactId: string) {
  const contact = await prisma.contact.findFirst({
    where: {
      id: contactId,
      userId,
      deletedAt: null
    }
  });

  if (!contact) {
    throw new Error("Контакт не найден");
  }

  return contact;
}

export async function createContact(
  userId: string,
  input: ContactInput,
  meta?: { ipAddress?: string }
) {
  const data = contactSchema.parse({
    ...input,
    phone: normalizePhone(input.phone),
    whatsapp: input.whatsapp ? normalizePhone(input.whatsapp) : undefined
  });

  const contact = await prisma.contact.create({
    data: {
      userId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
      whatsapp: data.whatsapp
    }
  });

  await writeSecurityLog({
    action: "contact_created",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      contactId: contact.id
    }
  });

  return contact;
}

export async function updateContact(
  userId: string,
  contactId: string,
  input: ContactInput,
  meta?: { ipAddress?: string }
) {
  await getContact(userId, contactId);

  const data = contactSchema.parse({
    ...input,
    phone: normalizePhone(input.phone),
    whatsapp: input.whatsapp ? normalizePhone(input.whatsapp) : undefined
  });

  const contact = await prisma.contact.update({
    where: {
      id: contactId
    },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
      whatsapp: data.whatsapp ?? null
    }
  });

  await writeSecurityLog({
    action: "contact_updated",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      contactId
    }
  });

  return contact;
}

export async function deleteContact(
  userId: string,
  contactId: string,
  meta?: { ipAddress?: string }
) {
  await getContact(userId, contactId);

  await prisma.contact.update({
    where: {
      id: contactId
    },
    data: {
      deletedAt: new Date()
    }
  });

  await writeSecurityLog({
    action: "contact_deleted",
    userId,
    ipAddress: meta?.ipAddress,
    metadata: {
      contactId
    }
  });
}

export async function getContactHistory(
  userId: string,
  contactId: string,
  options?: PaginationInput
) {
  const contact = await getContact(userId, contactId);
  const pagination = resolvePagination(
    options,
    CONTACT_HISTORY_PAGE_SIZE,
    MAX_RECORDS_PAGE_SIZE
  );
  const where = {
    userId,
    deletedAt: null,
    archivedAt: null,
    OR: [
      {
        senderContactId: contactId
      },
      {
        receiverContactId: contactId
      }
    ]
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
    contact,
    records,
    pagination: createPaginationMeta(pagination, total)
  };
}
