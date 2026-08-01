import type { MetTransaction, MetTransactionType } from "@/student/api/metHistory";
import { cn } from "@/shared/utils/cn";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface PaymentHistorySectionProps {
  transactions: MetTransaction[];
  isLoading?: boolean;
}

const typeMeta: Record<
  MetTransactionType,
  { label: string; amountClass: string; dotClass: string; icon: string }
> = {
  credit: {
    label: "شحن رصيد",
    amountClass: "text-[#14b8a6]",
    dotClass: "bg-[#14b8a6]",
    icon: "/images/admin/icon-coin.svg",
  },
  debit: {
    label: "خصم",
    amountClass: "text-[#ef4444]",
    dotClass: "bg-[#ef4444]",
    icon: "/images/student/icon-payment.svg",
  },
  purchase: {
    label: "تسجيل كورس",
    amountClass: "text-[#ef4444]",
    dotClass: "bg-[#ef4444]",
    icon: "/images/student/icon-payment.svg",
  },
  refund: {
    label: "استرداد",
    amountClass: "text-[#f59e0b]",
    dotClass: "bg-[#f59e0b]",
    icon: "/images/student/icon-route.svg",
  },
  unknown: {
    label: "عملية",
    amountClass: "text-[#64748b]",
    dotClass: "bg-[#94a3b8]",
    icon: "/images/student/icon-clock.svg",
  },
};

export const PaymentHistorySection = ({
  transactions,
  isLoading,
}: PaymentHistorySectionProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a]">
          <StudentIcon
            src="/images/student/icon-clock.svg"
            className="size-5 text-[#f5a524]"
          />
          سجل المعاملات
        </h2>
        <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#64748b]">
          {transactions.length} عملية
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#64748b]">
          لا توجد عمليات MET مسجّلة بعد.
        </p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => {
            const meta = typeMeta[tx.type] ?? typeMeta.unknown;
            return (
              <li
                key={tx.id}
                className="flex items-start gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3.5"
              >
                <span
                  className={cn(
                    "mt-1.5 size-2.5 shrink-0 rounded-full",
                    meta.dotClass,
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 text-right">
                      <p className="font-bold text-[#0f172a]">{tx.title}</p>
                      <p className="mt-1 text-xs text-[#94a3b8]">
                        {meta.label} · {tx.date}
                      </p>
                    </div>
                    <span
                      className={cn("shrink-0 text-sm font-black", meta.amountClass)}
                      dir="ltr"
                    >
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
