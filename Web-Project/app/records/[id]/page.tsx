import { deleteRecordAction, updateRecordAction } from "@/app/actions";
import { Notice } from "@/components/layout/notice";
import { PageShell } from "@/components/layout/page-shell";
import { RecordActions } from "@/components/records/record-actions";
import { RecordForm } from "@/components/records/record-form";
import { requirePageUser } from "@/server/auth/session";
import { listContacts } from "@/server/services/contact.service";
import { getRecord } from "@/server/services/record.service";

type RecordPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string; returnTo?: string }>;
};

export default async function RecordPage({ params, searchParams }: RecordPageProps) {
  const user = await requirePageUser();
  const { id } = await params;
  const query = await searchParams;
  const [contacts, record] = await Promise.all([
    listContacts(user.id),
    getRecord(user.id, id)
  ]);

  return (
    <PageShell title="Запись">
      <Notice error={query.error} message={query.message} />

      {record.deletedAt ? (
        <div className="rounded-lg border border-[#d8dee8] bg-white p-6 text-sm text-[#64748b]">
          Эта запись находится в разделе “Удаленные”. Чтобы изменить ее, сначала восстановите запись.
        </div>
      ) : (
        <>
          <RecordForm
            action={updateRecordAction.bind(null, record.id)}
            actions={
              <RecordActions
                deleteAction={deleteRecordAction.bind(null, record.id)}
                returnTo={query.returnTo}
              />
            }
            contacts={contacts}
            record={record}
            submitLabel="Сохранить изменения"
          />
        </>
      )}
    </PageShell>
  );
}
