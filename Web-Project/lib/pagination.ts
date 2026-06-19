export type PaginationInput = {
  limit?: number | string | null;
  page?: number | string | null;
};

export type ResolvedPagination = {
  limit: number;
  page: number;
  skip: number;
};

export type PaginationMeta = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

function positiveInteger(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function resolvePagination(
  input: PaginationInput | undefined,
  defaultLimit: number,
  maxLimit: number
): ResolvedPagination {
  const page = positiveInteger(input?.page, 1);
  const requestedLimit = positiveInteger(input?.limit, defaultLimit);
  const limit = Math.min(requestedLimit, maxLimit);

  return {
    limit,
    page,
    skip: (page - 1) * limit
  };
}

export function createPaginationMeta(
  pagination: ResolvedPagination,
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pagination.limit));

  return {
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
    limit: pagination.limit,
    page: pagination.page,
    total,
    totalPages
  };
}
