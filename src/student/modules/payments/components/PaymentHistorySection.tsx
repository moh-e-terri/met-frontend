import type { MetTransaction } from "@/student/api/metHistory";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface PaymentHistorySectionProps {
  transactions: MetTransaction[];
  currentMet?: number;
  isLoading?: boolean;
}

export const PaymentHistorySection = ({
  transactions,
  currentMet,
  isLoading,
}: PaymentHistorySectionProps) => {
  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" dir="rtl">
        <h2 className="flex items-center justify-start gap-2 text-lg font-bold text-[#0f172a]">
          <StudentIcon
            src="/images/student/icon-clock.svg"
            className="size-5 text-[#f5a524]"
          />
          <span>سجل نقاط MET</span>
        </h2>
        {typeof currentMet === "number" ? (
          <p className="text-sm text-[#64748b]">
            الرصيد الحالي:{" "}
            <span className="font-bold text-[#0f172a]" dir="ltr">
              {currentMet} MET
            </span>
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]" dir="rtl">
          لا توجد عمليات MET مسجّلة بعد.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px]" dir="rtl">
              <thead>
                <tr className="border-b border-[#e2e8f0] text-right text-sm text-[#64748b]">
                  <th className="px-3 py-3 font-medium">العملية</th>
                  <th className="px-3 py-3 font-medium">الوصف</th>
                  <th className="px-3 py-3 font-medium">التاريخ</th>
                  <th className="px-3 py-3 font-medium">المبلغ</th>
                  <th className="px-3 py-3 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-[#f1f5f9] text-right text-sm text-[#475569] last:border-0"
                  >
                    <td className="px-3 py-4 font-semibold text-[#0f172a]" dir="ltr">
                      {payment.id}
                    </td>
                    <td className="px-3 py-4 text-[#0f172a]">{payment.title}</td>
                    <td className="px-3 py-4">{payment.date}</td>
                    <td className="px-3 py-4 font-semibold text-[#0f172a]" dir="ltr">
                      {payment.amount}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          payment.status === "completed"
                            ? "bg-[#ecfdf5] text-[#14b8a6]"
                            : payment.status === "pending"
                              ? "bg-[#fff7ed] text-[#f5a524]"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {payment.status === "completed"
                          ? "مكتمل"
                          : payment.status === "pending"
                            ? "قيد المعالجة"
                            : "فشل"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden" dir="rtl">
            {transactions.map((payment) => (
              <article
                key={payment.id}
                className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4 text-right"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#14b8a6]">
                    {payment.status === "completed" ? "مكتمل" : payment.status}
                  </span>
                  <span className="font-semibold text-[#0f172a]" dir="ltr">
                    {payment.id}
                  </span>
                </div>
                <p className="font-medium text-[#0f172a]">{payment.title}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-[#64748b]">
                  <span dir="ltr" className="font-semibold text-[#0f172a]">
                    {payment.amount}
                  </span>
                  <span>{payment.date}</span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
