import { apiRequest } from "./client";
import type { ApiUser } from "../types/api";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string | null;
};

export type RecordListItem = {
  id: string;
  createdAt: string;
  senderFirstNameSnapshot: string | null;
  senderLastNameSnapshot: string | null;
  senderPhoneSnapshot: string | null;
  receiverFirstNameSnapshot: string | null;
  receiverLastNameSnapshot: string | null;
  receiverPhoneSnapshot: string | null;
  amount: string;
  currency: string;
  rate: string;
  timezone: string;
  restoreUntil: string | null;
};

export type RecordDetail = RecordListItem & {
  senderContactId: string | null;
  receiverContactId: string | null;
};

export type ContactInput = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
};

export type PersonInput = {
  contactId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type RecordInput = {
  sender: PersonInput;
  receiver: PersonInput;
  amount: string;
  currency: "TRY" | "USD" | "EUR" | "RUB" | "CNY";
  rate: string;
};

export type ProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};

export type SensitiveData = {
  email: string | null;
  phone: string | null;
};

export async function listContacts(token: string) {
  return apiRequest<{
    contacts: Contact[];
    pagination: PaginationMeta;
  }>("/api/contacts?limit=100", { token });
}

export async function saveContact(token: string, input: ContactInput, contactId?: string) {
  return apiRequest<{ contact: Contact }>(contactId ? `/api/contacts/${contactId}` : "/api/contacts", {
    method: contactId ? "PATCH" : "POST",
    token,
    body: input
  });
}

export async function deleteContact(token: string, contactId: string) {
  return apiRequest<Record<string, never>>(`/api/contacts/${contactId}`, {
    method: "DELETE",
    token
  });
}

export async function getContactHistory(token: string, contactId: string) {
  return apiRequest<{
    contact: Contact;
    records: RecordListItem[];
    pagination: PaginationMeta;
  }>(`/api/contacts/${contactId}?limit=25`, { token });
}

export async function listRecords(token: string) {
  return apiRequest<{
    records: RecordListItem[];
    pagination: PaginationMeta;
  }>("/api/records?limit=25", { token });
}

export async function getRecord(token: string, recordId: string) {
  return apiRequest<{ record: RecordDetail }>(`/api/records/${recordId}`, { token });
}

export async function saveRecord(token: string, input: RecordInput, recordId?: string) {
  return apiRequest<{ record: RecordDetail }>(recordId ? `/api/records/${recordId}` : "/api/records", {
    method: recordId ? "PATCH" : "POST",
    token,
    body: input
  });
}

export async function deleteRecord(token: string, recordId: string) {
  return apiRequest<{ record: RecordDetail }>(`/api/records/${recordId}`, {
    method: "DELETE",
    token
  });
}

export async function searchRecords(token: string, query: string) {
  return apiRequest<{
    records: RecordListItem[];
    pagination: PaginationMeta;
  }>(`/api/search?query=${encodeURIComponent(query)}&limit=25`, { token });
}

export async function listDeletedRecords(token: string) {
  return apiRequest<{
    records: RecordListItem[];
    pagination: PaginationMeta;
  }>("/api/deleted-records?limit=25", { token });
}

export async function restoreDeletedRecord(token: string, recordId: string) {
  return apiRequest<{ record: RecordDetail }>(`/api/deleted-records/${recordId}/restore`, {
    method: "POST",
    token
  });
}

export async function updateProfile(token: string, input: ProfileInput) {
  return apiRequest<{
    user: ApiUser;
    phoneChanged: boolean;
  }>("/api/settings", {
    method: "PATCH",
    token,
    body: {
      action: "profile",
      ...input
    }
  });
}

export async function updatePassword(token: string, currentPassword: string, newPassword: string) {
  return apiRequest<Record<string, never>>("/api/settings", {
    method: "PATCH",
    token,
    body: {
      action: "password",
      currentPassword,
      newPassword
    }
  });
}

export async function updateEmail(token: string, currentEmail: string, newEmail: string) {
  return apiRequest<Record<string, never>>("/api/settings", {
    method: "PATCH",
    token,
    body: {
      action: "email",
      currentEmail,
      newEmail
    }
  });
}

export async function revealSensitiveData(token: string, currentPassword: string) {
  return apiRequest<{ data: SensitiveData }>("/api/settings", {
    method: "PATCH",
    token,
    body: {
      action: "reveal-sensitive",
      currentPassword
    }
  });
}
