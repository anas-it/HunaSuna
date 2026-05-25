"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";
import { formatDateTime, formatPerson } from "@/lib/format";

type RecordItem = {
  id: string;
  createdAt: Date | string;
  senderFirstNameSnapshot: string | null;
  senderLastNameSnapshot: string | null;
  senderPhoneSnapshot: string | null;
  receiverFirstNameSnapshot: string | null;
  receiverLastNameSnapshot: string | null;
  receiverPhoneSnapshot: string | null;
  amount: string;
  currency: string;
  rate: string;
  timezone?: string | null;
};

type RecordListProps = {
  records: RecordItem[];
  showEditAction?: boolean;
};

type SortKey = "date" | "sender" | "receiver" | "amount" | "rate";
type SortDirection = "asc" | "desc";
type SortState = {
  key: SortKey;
  direction: SortDirection;
} | null;

type RecordCellProps = {
  children: React.ReactNode;
  className?: string;
  record: RecordItem;
  onOpen: (record: RecordItem) => void;
};

type SortButtonProps = {
  label: string;
  sortKey: SortKey;
  sortState: SortState;
  onSort: (key: SortKey) => void;
};

function recordDate(record: RecordItem) {
  return formatDateTime(new Date(record.createdAt));
}

function phoneText(phone?: string | null) {
  return phone || "Номер не указан";
}

function numericValue(value: string) {
  const parsed = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortValue(record: RecordItem, key: SortKey) {
  if (key === "date") {
    return new Date(record.createdAt).getTime();
  }

  if (key === "sender") {
    return formatPerson(record.senderFirstNameSnapshot, record.senderLastNameSnapshot).toLowerCase();
  }

  if (key === "receiver") {
    return formatPerson(
      record.receiverFirstNameSnapshot,
      record.receiverLastNameSnapshot
    ).toLowerCase();
  }

  if (key === "amount") {
    return numericValue(record.amount);
  }

  return numericValue(record.rate);
}

function SortButton({ label, sortKey, sortState, onSort }: SortButtonProps) {
  const isActive = sortState?.key === sortKey;
  const Icon = !isActive ? ArrowUpDown : sortState.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-left font-semibold text-[#475569] transition-colors hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
      type="button"
      onClick={() => onSort(sortKey)}
    >
      {label}
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function RecordCell({ children, className, record, onOpen }: RecordCellProps) {
  return (
    <button
      className="min-w-0 cursor-pointer rounded-md px-3 py-4 text-left transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
      type="button"
      onClick={() => onOpen(record)}
    >
      <span className={`block truncate ${className ?? ""}`}>{children}</span>
    </button>
  );
}

export function RecordList({ records, showEditAction = true }: RecordListProps) {
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [sortState, setSortState] = useState<SortState>(null);
  const columnsClass = showEditAction
    ? "grid-cols-[180px_1fr_1fr_140px_120px_150px]"
    : "grid-cols-[180px_1fr_1fr_140px_120px]";
  const widthClass = showEditAction ? "min-w-[900px]" : "min-w-[760px]";
  const sortedRecords = useMemo(() => {
    if (!sortState) {
      return records;
    }

    return records
      .map((record, index) => ({ index, record }))
      .sort((left, right) => {
        const leftValue = sortValue(left.record, sortState.key);
        const rightValue = sortValue(right.record, sortState.key);
        let result = 0;

        if (typeof leftValue === "number" && typeof rightValue === "number") {
          result = leftValue - rightValue;
        } else {
          result = String(leftValue).localeCompare(String(rightValue), "ru");
        }

        if (result === 0) {
          result = left.index - right.index;
        }

        return sortState.direction === "asc" ? result : -result;
      })
      .map(({ record }) => record);
  }, [records, sortState]);

  function openRecord(record: RecordItem) {
    setSelectedRecord(record);
  }

  function toggleSort(key: SortKey) {
    setSortState((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc"
        };
      }

      return {
        key,
        direction: key === "date" ? "desc" : "asc"
      };
    });
  }

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-[#d8dee8] bg-white p-6 text-sm text-[#64748b]">
        Записей пока нет.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className={widthClass}>
          <div className={`grid ${columnsClass} rounded-md border border-[#d8dee8] bg-[#f1f5f9] px-1 text-sm text-[#475569]`}>
            <div className="px-3 py-3">
              <SortButton label="Дата" sortKey="date" sortState={sortState} onSort={toggleSort} />
            </div>
            <div className="px-3 py-3">
              <SortButton
                label="От кого"
                sortKey="sender"
                sortState={sortState}
                onSort={toggleSort}
              />
            </div>
            <div className="px-3 py-3">
              <SortButton
                label="Кому"
                sortKey="receiver"
                sortState={sortState}
                onSort={toggleSort}
              />
            </div>
            <div className="px-3 py-3">
              <SortButton
                label="Сумма"
                sortKey="amount"
                sortState={sortState}
                onSort={toggleSort}
              />
            </div>
            <div className="px-3 py-3">
              <SortButton label="Курс" sortKey="rate" sortState={sortState} onSort={toggleSort} />
            </div>
            {showEditAction ? (
              <div className="px-3 py-3 font-semibold">Действие</div>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3">
            {sortedRecords.map((record) => (
              <div
                className={`grid ${columnsClass} items-center overflow-hidden rounded-md border border-[#d8dee8] bg-white text-sm shadow-sm transition-colors hover:border-[#cbd5e1] hover:bg-[#fbfcfe]`}
                key={record.id}
              >
                <RecordCell onOpen={openRecord} record={record}>
                  {recordDate(record)}
                </RecordCell>
                <RecordCell
                  className="text-[15px] font-medium"
                  onOpen={openRecord}
                  record={record}
                >
                  {formatPerson(record.senderFirstNameSnapshot, record.senderLastNameSnapshot)}
                </RecordCell>
                <RecordCell
                  className="text-[15px] font-medium"
                  onOpen={openRecord}
                  record={record}
                >
                  {formatPerson(record.receiverFirstNameSnapshot, record.receiverLastNameSnapshot)}
                </RecordCell>
                <RecordCell onOpen={openRecord} record={record}>
                  {record.amount} {record.currency}
                </RecordCell>
                <RecordCell onOpen={openRecord} record={record}>
                  {record.rate}
                </RecordCell>
                {showEditAction ? (
                  <div className="border-l border-[#e5eaf1] px-3 py-4">
                    <Link
                      className="inline-flex h-9 items-center justify-center rounded-md border border-[#d8dee8] bg-white px-3 text-sm font-medium text-[#256f6c] transition-colors hover:bg-[#eef2f6]"
                      href={`/records/${record.id}`}
                    >
                      Редактировать
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedRecord ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setSelectedRecord(null)}
        >
          <section
            aria-modal="true"
            className="w-full max-w-lg rounded-lg border border-[#d8dee8] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1f2937]">Информация о записи</h3>
                <p className="mt-1 text-sm text-[#64748b]">{recordDate(selectedRecord)}</p>
              </div>
              <button
                aria-label="Закрыть"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748b] transition-colors hover:bg-[#eef2f6] hover:text-[#1f2937]"
                onClick={() => setSelectedRecord(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 text-[15px]">
              <div className="rounded-md border border-[#e5eaf1] p-3">
                <p className="text-xs font-semibold uppercase text-[#64748b]">От кого</p>
                <p className="mt-1 font-semibold text-[#1f2937]">
                  {formatPerson(
                    selectedRecord.senderFirstNameSnapshot,
                    selectedRecord.senderLastNameSnapshot
                  )}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {phoneText(selectedRecord.senderPhoneSnapshot)}
                </p>
              </div>

              <div className="rounded-md border border-[#e5eaf1] p-3">
                <p className="text-xs font-semibold uppercase text-[#64748b]">Кому</p>
                <p className="mt-1 font-semibold text-[#1f2937]">
                  {formatPerson(
                    selectedRecord.receiverFirstNameSnapshot,
                    selectedRecord.receiverLastNameSnapshot
                  )}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {phoneText(selectedRecord.receiverPhoneSnapshot)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[#e5eaf1] p-3">
                  <p className="text-xs font-semibold uppercase text-[#64748b]">Сумма</p>
                  <p className="mt-1 font-medium text-[#1f2937]">
                    {selectedRecord.amount} {selectedRecord.currency}
                  </p>
                </div>
                <div className="rounded-md border border-[#e5eaf1] p-3">
                  <p className="text-xs font-semibold uppercase text-[#64748b]">Курс</p>
                  <p className="mt-1 font-medium text-[#1f2937]">{selectedRecord.rate}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-[#d8dee8] bg-white px-4 text-sm font-medium text-[#1f2937] transition-colors hover:bg-[#eef2f6]"
                onClick={() => setSelectedRecord(null)}
                type="button"
              >
                Закрыть
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
