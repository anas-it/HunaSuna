import Link from "next/link";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { RecordList } from "@/components/records/record-list";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/server/auth/session";
import { listContacts } from "@/server/services/contact.service";
import { listRecords } from "@/server/services/record.service";

type RecordsPageProps = {
  searchParams: Promise<{
    error?: string;
    query?: string;
    contactId?: string;
    date?: string;
    phone?: string;
  }>;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const user = await requirePageUser();
  const params = await searchParams;
  const [contacts, records] = await Promise.all([
    listContacts(user.id),
    listRecords(user.id, {
      query: params.query,
      contactId: params.contactId,
      date: params.date,
      phone: params.phone
    })
  ]);

  return (
    <PageShell
      title="Записи"
      description="История записей с поиском по контакту, дате и номеру телефона."
    >
      <Notice error={params.error} />

      <div className="mb-5">
        <Button asChild>
          <Link href="/records/new">Создать запись</Link>
        </Button>
      </div>

      <form className="mb-6 grid gap-3 rounded-lg border border-[#d8dee8] bg-white p-4 md:grid-cols-[1fr_220px_180px_180px_auto]">
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={params.query ?? ""}
          name="query"
          placeholder="Контакт"
        />
        <select
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={params.contactId ?? ""}
          name="contactId"
        >
          <option value="">Все контакты</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName}
            </option>
          ))}
        </select>
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={params.phone ?? ""}
          name="phone"
          placeholder="Телефон"
        />
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={params.date ?? ""}
          name="date"
          type="date"
        />
        <Button>Найти</Button>
      </form>

      <RecordList records={records} />
    </PageShell>
  );
}

