import Link from "next/link";
import { createContactAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/server/auth/session";
import { listContacts } from "@/server/services/contact.service";

type ContactsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const user = await requirePageUser();
  const params = await searchParams;
  const contacts = await listContacts(user.id);

  return (
    <PageShell
      title="Контакты"
      description="Список людей, которых можно выбирать при создании записи."
    >
      <Notice error={params.error} />

      <form action={createContactAction} className="mb-6 grid gap-3 rounded-lg border border-[#d8dee8] bg-white p-5 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          name="firstName"
          placeholder="Имя"
          required
        />
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          name="lastName"
          placeholder="Фамилия"
          required
        />
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          name="phone"
          placeholder="Телефон"
          required
        />
        <Button>Добавить</Button>
      </form>

      {contacts.length === 0 ? (
        <div className="rounded-lg border border-[#d8dee8] bg-white p-6 text-sm text-[#64748b]">
          Контактов пока нет.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#d8dee8] bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f1f5f9] text-[#475569]">
              <tr>
                <th className="px-4 py-3 font-semibold">Имя</th>
                <th className="px-4 py-3 font-semibold">Фамилия</th>
                <th className="px-4 py-3 font-semibold">Телефон</th>
                <th className="px-4 py-3 font-semibold">Действие</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr className="border-t border-[#e5eaf1]" key={contact.id}>
                  <td className="px-4 py-3">{contact.firstName}</td>
                  <td className="px-4 py-3">{contact.lastName}</td>
                  <td className="px-4 py-3">{contact.phone}</td>
                  <td className="px-4 py-3">
                    <Link className="font-medium text-[#256f6c]" href={`/contacts/${contact.id}`}>
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}

