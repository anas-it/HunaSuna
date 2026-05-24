import { restoreRecordAction } from "@/app/actions";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { daysLeft, formatDateTime, formatPerson } from "@/lib/format";
import { requirePageUser } from "@/server/auth/session";
import { listDeletedRecords } from "@/server/services/deleted-record.service";

export default async function DeletedPage() {
  const user = await requirePageUser();
  const records = await listDeletedRecords(user.id);

  return (
    <PageShell
      title="Удаленные"
      description="Удаленные записи можно восстановить в течение 7 дней. Редактировать их можно только после восстановления."
    >
      {records.length === 0 ? (
        <div className="rounded-lg border border-[#d8dee8] bg-white p-6 text-sm text-[#64748b]">
          Удаленных записей нет.
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <div className="rounded-lg border border-[#d8dee8] bg-white p-5" key={record.id}>
              <div className="grid gap-2 text-sm md:grid-cols-5">
                <div>
                  <p className="text-[#64748b]">Дата</p>
                  <strong>{formatDateTime(record.createdAt)}</strong>
                </div>
                <div>
                  <p className="text-[#64748b]">От кого</p>
                  <strong>
                    {formatPerson(record.senderFirstNameSnapshot, record.senderLastNameSnapshot)}
                  </strong>
                </div>
                <div>
                  <p className="text-[#64748b]">Кому</p>
                  <strong>
                    {formatPerson(record.receiverFirstNameSnapshot, record.receiverLastNameSnapshot)}
                  </strong>
                </div>
                <div>
                  <p className="text-[#64748b]">Сумма</p>
                  <strong>
                    {record.amount} {record.currency}
                  </strong>
                </div>
                <div>
                  <p className="text-[#64748b]">Осталось</p>
                  <strong>{daysLeft(record.restoreUntil)} дн.</strong>
                </div>
              </div>

              <form action={restoreRecordAction.bind(null, record.id)} className="mt-4">
                <Button>Восстановить</Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

