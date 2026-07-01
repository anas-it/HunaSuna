function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateTime(date: Date) {
  const day = padDatePart(date.getDate());
  const month = padDatePart(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = padDatePart(date.getHours());
  const minutes = padDatePart(date.getMinutes());

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

export function formatPerson(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ") || "Без имени";
}

export function daysLeft(until: Date | null) {
  if (!until) {
    return 0;
  }

  const diff = until.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

