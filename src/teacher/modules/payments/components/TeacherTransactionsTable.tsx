import type { TeacherFinanceTransaction, TeacherFinanceTxType } from "@/teacher/api";
import { cn } from "@/shared/utils/cn";

interface TeacherTransactionsTableProps {
  transactions?: TeacherFinanceTransaction[];
  isLoading?: boolean;
}

const typeMeta: Record<
  TeacherFinanceTxType,
  { label: string; amountClass: string; dotClass: string }
> = {
  earned: {
    label: "تسجيل طالب",
    amountClass: "text-[#14b8a6]",
    dotClass: "bg-[#14b8a6]",
  },
  released: {
    label: "صرف مستحقات",
    amountClass: "text-[#3b82f6]",
    dotClass: "bg-[#3b82f6]",
  },
  cancelled: {
    label: "إلغاء تسجيل",
    amountClass: "text-[#ef4444]",
    dotClass: "bg-[#ef4444]",
  },
  unknown: {
    label: "معاملة",
    amountClass: "text-[#64748b]",
    dotClass: "bg-[#94a3b8]",
  },
};

export const TeacherTransactionsTable = ({
  transactions = [],
  isLoading,
}: TeacherTransactionsTableProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-5 text-lg font-bold text-[#0f172a]">آخر المعاملات</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد معاملات مالية بعد.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => {
            const meta = typeMeta[tx.type] ?? typeMeta.unknown;
            return (
              <li
                key={tx.id}
                className="flex items-start gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3.5"
              >
                <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", meta.dotClass)} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 text-right">
                      <p className="font-bold text-[#0f172a]">{meta.label}</p>
                      <p className="mt-1 text-xs text-[#94a3b8]">
                        {tx.course} — {tx.date}
                      </p>
                      {tx.subtitle ? (
                        <p className="mt-0.5 text-xs text-[#64748b]">{tx.subtitle}</p>
                      ) : null}
                    </div>
                    <span className={cn("shrink-0 text-sm font-black", meta.amountClass)} dir="ltr">
                      {tx.amount}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
