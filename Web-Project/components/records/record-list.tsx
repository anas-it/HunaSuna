"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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
    return formatPerson(
      record.senderFirstNameSnapshot,
      record.senderLastNameSnapshot,
    ).toLowerCase();
  }

  if (key === "receiver") {
    return formatPerson(
      record.receiverFirstNameSnapshot,
      record.receiverLastNameSnapshot,
    ).toLowerCase();
  }

  if (key === "amount") {
    return numericValue(record.amount);
  }

  return numericValue(record.rate);
}

function SortButton({ label, sortKey, sortState, onSort }: SortButtonProps) {
  const isActive = sortState?.key === sortKey;
  const Icon = !isActive
    ? ArrowUpDown
    : sortState.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <button
      className="record-sort-button inline-flex cursor-pointer items-center gap-1 rounded-sm text-left font-semibold text-[#475569] transition-colors hover:text-[#1f2937] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
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
      className="record-list-cell flex min-w-0 cursor-pointer items-center px-3 py-2.5 text-left transition-colors hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#256f6c]"
      type="button"
      onClick={() => onOpen(record)}
    >
      <span className={`block truncate ${className ?? ""}`}>{children}</span>
    </button>
  );
}

export function RecordList({
  records,
  showEditAction = true,
}: RecordListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [sortState, setSortState] = useState<SortState>(null);
  const columnsClass = showEditAction
    ? "grid-cols-[166px_minmax(150px,1.15fr)_minmax(170px,1.15fr)_130px_86px_132px]"
    : "grid-cols-[166px_minmax(150px,1.15fr)_minmax(170px,1.15fr)_130px_86px]";
  const widthClass = showEditAction ? "min-w-[834px]" : "min-w-[702px]";
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
  const returnTo = useMemo(() => {
    const params = searchParams.toString();

    return params ? `${pathname}?${params}` : pathname;
  }, [pathname, searchParams]);

  function openRecord(record: RecordItem) {
    setSelectedRecord(record);
  }

  function toggleSort(key: SortKey) {
    setSortState((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: key === "date" ? "desc" : "asc",
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
      <div className="record-list-shell overflow-hidden rounded-lg border border-[#d8dee8] bg-white shadow-sm">
        <div className="hidden overflow-x-auto md:block">
          <div className={widthClass}>
            <div
              className={`record-list-header grid ${columnsClass} border-b border-[#d8dee8] bg-[#f8fafc] text-xs text-[#475569]`}
            >
              <div className="px-3 py-2.5">
                <SortButton
                  label="Дата"
                  sortKey="date"
                  sortState={sortState}
                  onSort={toggleSort}
                />
              </div>
              <div className="px-3 py-2.5">
                <SortButton
                  label="От кого"
                  sortKey="sender"
                  sortState={sortState}
                  onSort={toggleSort}
                />
              </div>
              <div className="px-3 py-2.5">
                <SortButton
                  label="Кому"
                  sortKey="receiver"
                  sortState={sortState}
                  onSort={toggleSort}
                />
              </div>
              <div className="px-3 py-2.5">
                <SortButton
                  label="Сумма"
                  sortKey="amount"
                  sortState={sortState}
                  onSort={toggleSort}
                />
              </div>
              <div className="px-3 py-2.5">
                <SortButton
                  label="Курс"
                  sortKey="rate"
                  sortState={sortState}
                  onSort={toggleSort}
                />
              </div>
              {showEditAction ? (
                <div className="px-3 py-2.5 font-semibold">Действие</div>
              ) : null}
            </div>

            <div className="record-list-body">
              {sortedRecords.map((record) => (
                <div
                  className={`record-list-row grid ${columnsClass} min-h-12 items-center text-sm transition-colors hover:bg-[#fbfcfe]`}
                  key={record.id}
                >
                  <RecordCell
                    className="record-list-date text-[#334155]"
                    onOpen={openRecord}
                    record={record}
                  >
                    {recordDate(record)}
                  </RecordCell>
                  <RecordCell
                    className="text-[15px] font-medium"
                    onOpen={openRecord}
                    record={record}
                  >
                    {formatPerson(
                      record.senderFirstNameSnapshot,
                      record.senderLastNameSnapshot,
                    )}
                  </RecordCell>
                  <RecordCell
                    className="text-[15px] font-medium"
                    onOpen={openRecord}
                    record={record}
                  >
                    {formatPerson(
                      record.receiverFirstNameSnapshot,
                      record.receiverLastNameSnapshot,
                    )}
                  </RecordCell>
                  <RecordCell onOpen={openRecord} record={record}>
                    {record.amount} {record.currency}
                  </RecordCell>
                  <RecordCell onOpen={openRecord} record={record}>
                    {record.rate}
                  </RecordCell>
                  {showEditAction ? (
                    <div className="record-list-action border-l border-[#e5eaf1] px-3 py-2">
                      <Link
                        className="record-list-edit inline-flex h-8 w-full items-center justify-center rounded-md border border-[#d8dee8] bg-white px-2 text-xs font-semibold text-[#256f6c] transition-colors hover:bg-[#eef2f6]"
                        href={`/records/${record.id}?returnTo=${encodeURIComponent(returnTo)}`}
                        prefetch={false}
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

        <div className="record-list-mobile-list grid md:hidden">
          {sortedRecords.map((record) => (
            <div className="record-list-mobile-card bg-white p-3" key={record.id}>
              <button
                className="w-full cursor-pointer rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#256f6c]"
                type="button"
                onClick={() => openRecord(record)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-[#64748b]">
                      {recordDate(record)}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-[#1f2937]">
                      {formatPerson(
                        record.senderFirstNameSnapshot,
                        record.senderLastNameSnapshot,
                      )}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-[#256f6c]">
                    {record.amount} {record.currency}
                  </p>
                </div>

                <div className="mt-2 grid gap-1.5 text-sm">
                  <p className="min-w-0 truncate text-[#1f2937]">
                    <span className="text-[#64748b]">Кому: </span>
                    {formatPerson(
                      record.receiverFirstNameSnapshot,
                      record.receiverLastNameSnapshot,
                    )}
                  </p>
                  <p className="text-[#64748b]">
                    Курс:{" "}
                    <span className="font-medium text-[#1f2937]">
                      {record.rate}
                    </span>
                  </p>
                </div>
              </button>

              {showEditAction ? (
                <div className="mt-3 flex justify-end">
                  <Link
                    className="record-list-edit inline-flex h-8 items-center justify-center rounded-md border border-[#d8dee8] bg-white px-3 text-xs font-semibold text-[#256f6c] transition-colors hover:bg-[#eef2f6]"
                    href={`/records/${record.id}?returnTo=${encodeURIComponent(returnTo)}`}
                    prefetch={false}
                  >
                    Редактировать
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
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
                <h3 className="text-lg font-semibold text-[#1f2937]">
                  Информация о записи
                </h3>
                <p className="mt-1 text-sm text-[#64748b]">
                  {recordDate(selectedRecord)}
                </p>
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
                <p className="text-xs font-semibold uppercase text-[#64748b]">
                  От кого
                </p>
                <p className="mt-1 font-semibold text-[#1f2937]">
                  {formatPerson(
                    selectedRecord.senderFirstNameSnapshot,
                    selectedRecord.senderLastNameSnapshot,
                  )}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {phoneText(selectedRecord.senderPhoneSnapshot)}
                </p>
              </div>

              <div className="rounded-md border border-[#e5eaf1] p-3">
                <p className="text-xs font-semibold uppercase text-[#64748b]">
                  Кому
                </p>
                <p className="mt-1 font-semibold text-[#1f2937]">
                  {formatPerson(
                    selectedRecord.receiverFirstNameSnapshot,
                    selectedRecord.receiverLastNameSnapshot,
                  )}
                </p>
                <p className="mt-1 text-sm text-[#64748b]">
                  {phoneText(selectedRecord.receiverPhoneSnapshot)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[#e5eaf1] p-3">
                  <p className="text-xs font-semibold uppercase text-[#64748b]">
                    Сумма
                  </p>
                  <p className="mt-1 font-medium text-[#1f2937]">
                    {selectedRecord.amount} {selectedRecord.currency}
                  </p>
                </div>
                <div className="rounded-md border border-[#e5eaf1] p-3">
                  <p className="text-xs font-semibold uppercase text-[#64748b]">
                    Курс
                  </p>
                  <p className="mt-1 font-medium text-[#1f2937]">
                    {selectedRecord.rate}
                  </p>
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
