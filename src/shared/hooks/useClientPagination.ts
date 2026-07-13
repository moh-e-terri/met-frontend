import { useEffect, useMemo, useState } from "react";
import { paginateItems, type PaginatedResult } from "@/core/api/pagination";

export function useClientPagination<T>(
  items: T[],
  limit = 10,
): PaginatedResult<T> & { setPage: (page: number) => void; page: number } {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items, limit]);

  const result = useMemo(() => paginateItems(items, page, limit), [items, page, limit]);

  useEffect(() => {
    if (page > result.pagination.totalPages) {
      setPage(result.pagination.totalPages);
    }
  }, [page, result.pagination.totalPages]);

  return {
    ...result,
    page,
    setPage,
  };
}
