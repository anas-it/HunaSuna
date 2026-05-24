import Link from "next/link";
import { formatDateTime, formatPerson } from "@/lib/format";

type RecordItem = {
  id: string;
  createdAt: Date;
  senderFirstNameSnapshot: string | null;
  senderLastNameSnapshot: string | null;
  receiverFirstNameSnapshot: string | null;
  receiverLastNameSnapshot: string | null;
  amount: string;
  currency: string;
  rate: string;
};

type RecordListProps = {
  records: RecordItem[];
};

export function RecordList({ records }: RecordListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-[#d8dee8] bg-white p-6 text-sm text-[#64748b]">
        Записей пока нет.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#d8dee8] bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#f1f5f9] text-[#475569]">
          <tr>
            <th className="px-4 py-3 font-semibold">Дата</th>
            <th className="px-4 py-3 font-semibold">От кого</th>
            <th className="px-4 py-3 font-semibold">Кому</th>
            <th className="px-4 py-3 font-semibold">Сумма</th>
            <th className="px-4 py-3 font-semibold">Курс</th>
            <th className="px-4 py-3 font-semibold">Действие</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr className="border-t border-[#e5eaf1]" key={record.id}>
              <td className="px-4 py-3">{formatDateTime(record.createdAt)}</td>
              <td className="px-4 py-3">
                {formatPerson(record.senderFirstNameSnapshot, record.senderLastNameSnapshot)}
              </td>
              <td className="px-4 py-3">
                {formatPerson(record.receiverFirstNameSnapshot, record.receiverLastNameSnapshot)}
              </td>
              <td className="px-4 py-3">
                {record.amount} {record.currency}
              </td>
              <td className="px-4 py-3">{record.rate}</td>
              <td className="px-4 py-3">
                <Link className="font-medium text-[#256f6c]" href={`/records/${record.id}`}>
                  Открыть
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

