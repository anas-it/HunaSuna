import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/pagination";

type PaginationNavProps = {
  basePath: string;
  pagination: PaginationMeta;
  params?: Record<string, string | undefined>;
};

type PageItem = number | "ellipsis";

function pageHref(
  basePath: string,
  params: Record<string, string | undefined> | undefined,
  page: number
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (!value || key === "error" || key === "page") {
      continue;
    }

    searchParams.set(key, value);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function pageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);

  if (page <= 4) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
    pages.add(5);
  }

  if (page >= totalPages - 3) {
    pages.add(totalPages - 4);
    pages.add(totalPages - 3);
    pages.add(totalPages - 2);
    pages.add(totalPages - 1);
  }

  const sortedPages = Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((left, right) => left - right);
  const items: PageItem[] = [];

  for (const currentPage of sortedPages) {
    const previousPage = items[items.length - 1];

    if (
      typeof previousPage === "number" &&
      currentPage - previousPage > 1
    ) {
      items.push("ellipsis");
    }

    items.push(currentPage);
  }

  return items;
}

export function PaginationNav({
  basePath,
  pagination,
  params
}: PaginationNavProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const items = pageItems(pagination.page, pagination.totalPages);

  return (
    <nav className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#64748b]">
      <span>
        Страница {pagination.page} из {pagination.totalPages}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {pagination.hasPreviousPage ? (
          <Button asChild variant="secondary">
            <Link
              href={pageHref(basePath, params, pagination.page - 1)}
              prefetch={false}
            >
              Назад
            </Link>
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Назад
          </Button>
        )}

        <div className="flex flex-wrap items-center gap-1">
          {items.map((item, index) =>
            item === "ellipsis" ? (
              <span
                className="inline-flex h-9 min-w-9 items-center justify-center px-2 text-[#94a3b8]"
                key={`ellipsis-${index}`}
              >
                ...
              </span>
            ) : item === pagination.page ? (
              <span
                aria-current="page"
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-[#256f6c] px-3 text-sm font-semibold text-white"
                key={item}
              >
                {item}
              </span>
            ) : (
              <Link
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[#d8dee8] bg-white px-3 text-sm font-semibold text-[#1f2937] transition-colors hover:bg-[#eef2f6]"
                href={pageHref(basePath, params, item)}
                key={item}
                prefetch={false}
              >
                {item}
              </Link>
            )
          )}
        </div>

        {pagination.hasNextPage ? (
          <Button asChild variant="secondary">
            <Link
              href={pageHref(basePath, params, pagination.page + 1)}
              prefetch={false}
            >
              Вперед
            </Link>
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Вперед
          </Button>
        )}
      </div>
    </nav>
  );
}
