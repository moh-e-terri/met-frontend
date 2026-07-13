import { cn } from "@/shared/utils/cn";
import { getVisiblePages, type PaginationMeta } from "@/core/api/pagination";

interface PaginationProps {
  pagination: Pick<
    PaginationMeta,
    "page" | "totalPages" | "hasPrevPage" | "hasNextPage"
  >;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  summary?: React.ReactNode;
  maxVisible?: number;
}

export const Pagination = ({
  pagination,
  onPageChange,
  disabled = false,
  className,
  summary,
  maxVisible = 3,
}: PaginationProps) => {
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  if (totalPages <= 1 && !summary) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages, maxVisible);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-[#f1f5f9] pt-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {summary ? (
        <div className="text-right text-sm text-[#64748b]">{summary}</div>
      ) : (
        <span className="hidden sm:block" />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2" dir="ltr">
          <button
            type="button"
            disabled={disabled || !hasPrevPage}
            onClick={() => onPageChange(page - 1)}
            className="flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="الصفحة السابقة"
          >
            ‹
          </button>

          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                "flex size-9 items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                pageNumber === page
                  ? "bg-[#f5a524] text-white shadow-sm"
                  : "border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc]",
              )}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={disabled || !hasNextPage}
            onClick={() => onPageChange(page + 1)}
            className="flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="الصفحة التالية"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
};
