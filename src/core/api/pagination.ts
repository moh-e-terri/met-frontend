import { asRecord, pickNumber } from "./utils";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export function mapPaginationMeta(
  envelope: unknown,
  fallback: { page: number; limit: number; total?: number },
): PaginationMeta {
  const record = asRecord(envelope);
  const pagination = asRecord(record.pagination ?? record.meta);
  const limit =
    pickNumber(pagination.limit, pagination.perPage, fallback.limit) || fallback.limit;
  const total = pickNumber(
    pagination.total,
    pagination.totalItems,
    pagination.count,
    fallback.total,
  );
  const totalPages =
    pickNumber(pagination.totalPages, pagination.pages) ||
    Math.max(1, Math.ceil(total / limit) || 1);
  const page =
    pickNumber(pagination.page, pagination.currentPage, fallback.page) || fallback.page;

  return {
    total,
    page: Math.min(Math.max(1, page), totalPages),
    limit,
    totalPages,
    hasNextPage: Boolean(pagination.hasNextPage ?? pagination.hasNext ?? page < totalPages),
    hasPrevPage: Boolean(pagination.hasPrevPage ?? pagination.hasPrev ?? page > 1),
  };
}

export function paginateItems<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: {
      total,
      page: safePage,
      limit,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  envelope: unknown,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const record = asRecord(envelope);
  const hasServerPagination = Boolean(record.pagination ?? record.meta);

  if (hasServerPagination) {
    return {
      items,
      pagination: mapPaginationMeta(envelope, { page, limit, total: items.length }),
    };
  }

  return paginateItems(items, page, limit);
}

export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible = 3,
): number[] {
  if (totalPages <= 0) return [1];
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
