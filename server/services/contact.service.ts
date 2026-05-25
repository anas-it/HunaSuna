import { prisma } from "@/server/db/prisma";
import { normalizePhone } from "@/lib/phone";
import { writeSecurityLog } from "@/server/logs/security-log.service";
import { contactSchema } from "@/server/validators/contact.validator";

type ContactInput = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
};

export type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string | null;
};

export async function listContacts(userId: string): Promise<ContactListItem[]> {
  return prisma.contact.findMany({
    where: {
      userId,
      deletedAt: null
    },
    orderBy: [
      {
        firstName: "asc"
      },
      {
        lastName: "asc"
      }
    ]
  });
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

export async function getContactHistory(userId: string, contactId: string) {
  const contact = await getContact(userId, contactId);

  const records = await prisma.record.findMany({
    where: {
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
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return {
    contact,
    records
  };
}
