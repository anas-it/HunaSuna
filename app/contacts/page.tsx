import Link from "next/link";
import { MessageCircle, Pencil, Phone, UserPlus, Users } from "lucide-react";
import { createContactAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/server/auth/session";
import { listContacts } from "@/server/services/contact.service";

type ContactsPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function contactInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const user = await requirePageUser();
  const params = await searchParams;
  const contacts = await listContacts(user.id);

  return (
    <PageShell title="Контакты">
      <Notice error={params.error} />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <form
          action={createContactAction}
          className="h-fit rounded-md border border-[#d8dee8] bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#eef7f6] text-[#256f6c]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1f2937]">Новый контакт</h2>
              <p className="text-sm text-[#64748b]">Всего контактов: {contacts.length}</p>
            </div>
          </div>

          <div className="grid gap-3">
            <input
              className="h-11 rounded-md border border-[#cbd5e1] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
              name="firstName"
              placeholder="Имя"
              required
            />
            <input
              className="h-11 rounded-md border border-[#cbd5e1] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
              name="lastName"
              placeholder="Фамилия"
              required
            />
            <input
              className="h-11 rounded-md border border-[#cbd5e1] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
              name="phone"
              placeholder="Телефон"
              required
            />
            <input
              className="h-11 rounded-md border border-[#cbd5e1] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
              name="whatsapp"
              placeholder="WhatsApp"
            />
            <Button className="mt-1 gap-2">
              <UserPlus className="h-4 w-4" />
              Добавить
            </Button>
          </div>
        </form>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-[#d8dee8] bg-[#f1f5f9] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#475569]">
              <Users className="h-4 w-4" />
              Список контактов
            </div>
            <span className="rounded-md border border-[#d8dee8] bg-white px-2.5 py-1 text-xs font-medium text-[#64748b]">
              {contacts.length}
            </span>
          </div>

          {contacts.length === 0 ? (
            <div className="rounded-md border border-[#d8dee8] bg-white p-6 text-sm text-[#64748b]">
              Контактов пока нет.
            </div>
          ) : (
            <div className="grid gap-2">
              {contacts.map((contact) => (
                <article
                  className="rounded-md border border-[#d8dee8] bg-white p-3 shadow-sm transition-colors hover:border-[#cbd5e1] hover:bg-[#fbfcfe]"
                  key={contact.id}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#cfe3e1] bg-[#eef7f6] text-sm font-semibold text-[#1f5d5a]">
                      {contactInitials(contact.firstName, contact.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-[#1f2937]">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <div className="mt-1 grid gap-1 text-sm text-[#64748b] sm:grid-cols-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-[#256f6c]" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                        <div className="flex min-w-0 items-center gap-2">
                          <MessageCircle className="h-4 w-4 shrink-0 text-[#256f6c]" />
                          <span className="truncate">{contact.whatsapp || "WhatsApp не указан"}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-[#d8dee8] bg-white px-3 text-sm font-medium text-[#256f6c] transition-colors hover:bg-[#eef2f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
                      href={`/contacts/${contact.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                      Редактировать
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
