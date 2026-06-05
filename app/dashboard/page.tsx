import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { RecordList } from "@/components/records/record-list";
import { Button } from "@/components/ui/button";
import { requirePageUser } from "@/server/auth/session";
import { getDashboardSummary } from "@/server/services/dashboard.service";

export default async function DashboardPage() {
  const user = await requirePageUser();
  const { contactsCount, deletedCount, latestRecords, recordsCount } =
    await getDashboardSummary(user.id);

  return (
    <PageShell title="Главная">
      <div className="mb-6 flex flex-wrap justify-end gap-3">
        <Button asChild variant="secondary">
          <Link href="/contacts">Контакты</Link>
        </Button>
        <Button asChild>
          <Link href="/records/new">Создать запись</Link>
        </Button>
      </div>

      <form action="/records" className="mb-6 grid gap-3 rounded-lg border border-[#d8dee8] bg-white p-4 md:grid-cols-[1fr_180px_auto]">
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          name="query"
          placeholder="Поиск по контакту"
        />
        <input
          className="rounded-md border border-[#cbd5e1] px-3 py-2"
          name="phone"
          placeholder="Номер телефона"
        />
        <Button>Найти</Button>
      </form>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-[#d8dee8] bg-white p-5">
          <p className="text-sm text-[#64748b]">Контакты</p>
          <strong className="mt-2 block text-3xl">{contactsCount}</strong>
        </div>
        <div className="rounded-lg border border-[#d8dee8] bg-white p-5">
          <p className="text-sm text-[#64748b]">Активные записи</p>
          <strong className="mt-2 block text-3xl">{recordsCount}</strong>
        </div>
        <div className="rounded-lg border border-[#d8dee8] bg-white p-5">
          <p className="text-sm text-[#64748b]">Удаленные</p>
          <strong className="mt-2 block text-3xl">{deletedCount}</strong>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Последние записи</h2>
        <Link className="text-sm font-medium text-[#256f6c]" href="/records">
          Все записи
        </Link>
      </div>
      <RecordList records={latestRecords} />
    </PageShell>
  );
}
