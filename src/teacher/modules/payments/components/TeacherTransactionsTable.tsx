import type { TeacherFinanceTransaction, TeacherTransactionStatus } from "@/teacher/api";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

const transactionStatusLabels: Record<
  TeacherTransactionStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "مكتمل",
    className: "bg-[#ecfdf5] text-[#14b8a6]",
  },
  pending: {
    label: "قيد الانتظار",
    className: "bg-[#fff7ed] text-[#f5a524]",
  },
  failed: {
    label: "فشل",
    className: "bg-[#fef2f2] text-[#ef4444]",
  },
};

interface TeacherTransactionsTableProps {
  transactions?: TeacherFinanceTransaction[];
  isLoading?: boolean;
}

export const TeacherTransactionsTable = ({
  transactions = [],
  isLoading,
}: TeacherTransactionsTableProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#0f172a]">المعاملات الأخيرة</h2>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#f5a524] hover:underline"
        >
          <span>عرض البيان</span>
          <TeacherIcon src="/images/student/icon-route.svg" className="size-4 rotate-180" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد معاملات مالية بعد.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-right text-sm text-[#64748b]">
                  <th className="px-3 py-3 font-medium">التاريخ</th>
                  <th className="px-3 py-3 font-medium">اسم المساق</th>
                  <th className="px-3 py-3 font-medium">رقم المعاملة</th>
                  <th className="px-3 py-3 font-medium">كمية</th>
                  <th className="px-3 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const status = transactionStatusLabels[tx.status];

                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-[#f1f5f9] text-right text-sm last:border-0"
                    >
                      <td className="px-3 py-4 text-[#64748b]" dir="ltr">
                        {tx.date}
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-bold text-[#0f172a]">{tx.course}</p>
                        <p className="mt-0.5 text-xs text-[#94a3b8]">{tx.subtitle}</p>
                      </td>
                      <td className="px-3 py-4 font-semibold text-[#0f172a]" dir="ltr">
                        {tx.id}
                      </td>
                      <td className="px-3 py-4 font-bold text-[#0f172a]" dir="ltr">
                        {tx.amount}
                      </td>
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {transactions.map((tx) => {
              const status = transactionStatusLabels[tx.status];

              return (
                <article
                  key={tx.id}
                  className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <span className="text-xs text-[#94a3b8]" dir="ltr">
                      {tx.date}
                    </span>
                  </div>
                  <p className="font-bold text-[#0f172a]">{tx.course}</p>
                  <p className="mt-1 text-xs text-[#94a3b8]">{tx.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-[#0f172a]" dir="ltr">
                      {tx.amount}
                    </span>
                    <span className="text-xs text-[#64748b]" dir="ltr">
                      {tx.id}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
