import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/lib/pagination";

type PaginationNavProps = {
  basePath: string;
  pagination: PaginationMeta;
  params?: Record<string, string | undefined>;
};

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

export function PaginationNav({ basePath, pagination, params }: PaginationNavProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <nav className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#64748b]">
      <span>
        Страница {pagination.page} из {pagination.totalPages}
      </span>
      <div className="flex gap-2">
        {pagination.hasPreviousPage ? (
          <Button asChild variant="secondary">
            <Link href={pageHref(basePath, params, pagination.page - 1)}>Назад</Link>
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Назад
          </Button>
        )}
        {pagination.hasNextPage ? (
          <Button asChild variant="secondary">
            <Link href={pageHref(basePath, params, pagination.page + 1)}>Вперед</Link>
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
