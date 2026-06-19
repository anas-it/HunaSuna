export type AppSection = "new-record" | "contacts" | "records" | "search" | "deleted" | "settings";

export type AppSectionMeta = {
  title: string;
  subtitle: string;
};

export const sectionMeta: Record<AppSection, AppSectionMeta> = {
  "new-record": {
    title: "Создать запись",
    subtitle: "Форма записи"
  },
  contacts: {
    title: "Контакты",
    subtitle: "Список контактов"
  },
  records: {
    title: "Записи",
    subtitle: "История записей"
  },
  search: {
    title: "Поиск",
    subtitle: "Контакт или номер телефона"
  },
  deleted: {
    title: "Удаленные",
    subtitle: "Восстановление записей"
  },
  settings: {
    title: "Настройки",
    subtitle: "Аккаунт и безопасность"
  }
};
