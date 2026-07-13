import { useState } from "react";
import type { AdminFinancePayment } from "@/admin/api";
import { Pagination } from "@/shared/components/Pagination";
import { useClientPagination } from "@/shared/hooks/useClientPagination";
import { transactionStatusLabels } from "../data/mockAdminFinancials";

interface AdminFinancialTransactionsTableProps {
  payments: AdminFinancePayment[];
  isLoading?: boolean;
  onRelease?: (instructorId: string, amount: number, note?: string) => void | Promise<void>;
  releasingId?: string | null;
}

export const AdminFinancialTransactionsTable = ({
  payments,
  isLoading,
  onRelease,
  releasingId,
}: AdminFinancialTransactionsTableProps) => {
  const [releaseAmounts, setReleaseAmounts] = useState<Record<string, string>>({});
  const { items: pagedPayments, pagination, setPage } = useClientPagination(payments, 10);

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#0f172a]">مستحقات المدرسين</h2>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : payments.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#64748b]">لا توجد مدفوعات حالياً.</p>
      ) : (
        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[#e2e8f0] text-right text-sm text-[#64748b]">
                <th className="px-3 py-3 font-medium">الدورة والطالب</th>
                <th className="px-3 py-3 font-medium">المبلغ</th>
                <th className="px-3 py-3 font-medium">حصة المدرس / المنصة</th>
                <th className="px-3 py-3 font-medium">الحالة</th>
                <th className="px-3 py-3 font-medium">صرف</th>
              </tr>
            </thead>
            <tbody>
              {pagedPayments.map((tx) => {
                const status = transactionStatusLabels[tx.status];
                const amountValue =
                  releaseAmounts[tx.id] ??
                  String(tx.releasableAmount ?? tx.trainerShare ?? "");

                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[#f1f5f9] text-sm last:border-0"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="text-right">
                          <p className="font-bold text-[#0f172a]">{tx.course}</p>
                          <p className="mt-0.5 text-xs text-[#94a3b8]">
                            {tx.student}
                          </p>
                        </div>
                        <img
                          src={tx.courseIcon}
                          alt=""
                          className="size-10 rounded-xl"
                          aria-hidden
                        />
                      </div>
                    </td>
                    <td className="px-3 py-4 font-bold text-[#0f172a]" dir="ltr">
                      {tx.amount}
                    </td>
                    <td className="px-3 py-4 text-[#475569]" dir="ltr">
                      {tx.trainerShare} / {tx.platformShare}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {tx.instructorId && onRelease && tx.status !== "completed" ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={amountValue}
                            onChange={(event) =>
                              setReleaseAmounts((current) => ({
                                ...current,
                                [tx.id]: event.target.value,
                              }))
                            }
                            className="h-9 w-24 rounded-xl border border-[#e2e8f0] px-2 text-sm outline-none focus:border-[#f5a524]"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            disabled={releasingId === tx.instructorId}
                            onClick={() =>
                              onRelease(
                                tx.instructorId!,
                                Number(amountValue),
                                `صرف مستحقات - ${tx.course}`,
                              )
                            }
                            className="rounded-xl bg-[#f5a524] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                          >
                            {releasingId === tx.instructorId ? "..." : "صرف"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#94a3b8]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && payments.length > 0 ? (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          summary={
            <>
              عرض {pagedPayments.length} من أصل {payments.length} معاملة
            </>
          }
        />
      ) : null}
    </section>
  );
};
