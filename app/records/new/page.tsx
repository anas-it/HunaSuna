import { createRecordAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { RecordForm } from "@/components/records/record-form";
import { requirePageUser } from "@/server/auth/session";
import { listContacts } from "@/server/services/contact.service";

type NewRecordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewRecordPage({ searchParams }: NewRecordPageProps) {
  const user = await requirePageUser();
  const params = await searchParams;
  const contacts = await listContacts(user.id);

  return (
    <PageShell
      title="Создать запись"
      description="Выберите контакт или введите данные вручную. Номер при ручном вводе необязателен."
    >
      <Notice error={params.error} />
      <RecordForm action={createRecordAction} contacts={contacts} submitLabel="Сохранить запись" />
    </PageShell>
  );
}

