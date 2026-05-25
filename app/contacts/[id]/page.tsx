import { deleteContactAction, updateContactAction } from "@/app/actions";
import { SingleSubmitForm } from "@/components/forms/single-submit-form";
import { ContactActions } from "@/components/contacts/contact-actions";
import { Notice } from "@/components/layout/notice";
import { PaginationNav } from "@/components/layout/pagination-nav";
import { PageShell } from "@/components/layout/page-shell";
import { RecordList } from "@/components/records/record-list";
import { SubmitButton } from "@/components/ui/submit-button";
import { requirePageUser } from "@/server/auth/session";
import { getContactHistory } from "@/server/services/contact.service";

type ContactPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string; page?: string }>;
};

export default async function ContactPage({ params, searchParams }: ContactPageProps) {
  const user = await requirePageUser();
  const { id } = await params;
  const query = await searchParams;
  const { contact, pagination, records } = await getContactHistory(user.id, id, {
    page: query.page
  });

  return (
    <PageShell title={`${contact.firstName} ${contact.lastName}`}>
      <Notice error={query.error} message={query.message} />

      <SingleSubmitForm
        action={updateContactAction.bind(null, contact.id)}
        className="mb-6 grid gap-3 rounded-md border border-[#d8dee8] bg-white p-5 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
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
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          defaultValue={contact.whatsapp ?? ""}
          name="whatsapp"
          placeholder="WhatsApp"
        />
        <SubmitButton pendingLabel="Сохранение...">Сохранить</SubmitButton>
      </SingleSubmitForm>

      <div className="mb-8 flex justify-end">
        <ContactActions deleteAction={deleteContactAction.bind(null, contact.id)} />
      </div>

      <h2 className="mb-3 text-xl font-semibold">История контакта</h2>
      <RecordList records={records} showEditAction={false} />
      <PaginationNav
        basePath={`/contacts/${contact.id}`}
        pagination={pagination}
        params={query}
      />
    </PageShell>
  );
}
