import type { RecordListItem } from "../api/hunasuna";

export function contactName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Без имени";
}

export function recordPerson(record: RecordListItem, side: "sender" | "receiver") {
  if (side === "sender") {
    return contactName(record.senderFirstNameSnapshot, record.senderLastNameSnapshot);
  }

  return contactName(record.receiverFirstNameSnapshot, record.receiverLastNameSnapshot);
}

export function recordPhone(record: RecordListItem, side: "sender" | "receiver") {
  return side === "sender" ? record.senderPhoneSnapshot : record.receiverPhoneSnapshot;
}

export function formatRecordTitle(record: RecordListItem) {
  return `${recordPerson(record, "sender")} -> ${recordPerson(record, "receiver")}`;
}

export function formatRecordMeta(record: RecordListItem) {
  return `${record.amount} ${record.currency} | курс ${record.rate}`;
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
