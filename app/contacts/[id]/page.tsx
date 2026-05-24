import { deleteContactAction, updateContactAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { RecordList } from "@/components/records/record-list";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/server/auth/session";
import { getContactHistory } from "@/server/services/contact.service";

type ContactPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const user = await requirePageUser();
  const { id } = await params;
  const query = await searchParams;
  const { contact, records } = await getContactHistory(user.id, id);

  return (
    <PageShell
      title={`${contact.firstName} ${contact.lastName}`}
      description="Карточка контакта и история записей, где этот контакт был выбран из списка."
    >
      <Notice error={query.error} />

      <form
        action={updateContactAction.bind(null, contact.id)}
        className="mb-6 grid gap-3 rounded-lg border border-[#d8dee8] bg-white p-5 md:grid-cols-[1fr_1fr_1fr_auto]"
      >
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={contact.firstName}
          name="firstName"
          placeholder="Имя"
          required
        />
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={contact.lastName}
          name="lastName"
          placeholder="Фамилия"
          required
        />
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={contact.phone}
          name="phone"
          placeholder="Телефон"
          required
        />
        <Button>Сохранить</Button>
      </form>

      <form action={deleteContactAction.bind(null, contact.id)} className="mb-8">
        <Button variant="secondary">Удалить контакт</Button>
      </form>

      <h2 className="mb-3 text-xl font-semibold">История контакта</h2>
      <RecordList records={records} />
    </PageShell>
  );
}

