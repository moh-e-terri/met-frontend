import { cn } from "@/shared/utils/cn";
import { useMemo } from "react";
import type { FinancialBottomMetrics } from "@/admin/api";
import { AnimatedChartBar, CountUp } from "@/shared/motion";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface AdminFinancialBottomCardsProps {
  metrics: FinancialBottomMetrics;
  isLoading?: boolean;
}

export const AdminFinancialBottomCards = ({
  metrics,
  isLoading,
}: AdminFinancialBottomCardsProps) => {
  const maxValue = useMemo(
    () => Math.max(...metrics.revenueGrowthChart.map((item) => item.value), 1),
    [metrics.revenueGrowthChart],
  );

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]"
      dir="rtl"
    >
      <div className="rounded-3xl border border-[#bbf7d0] bg-[#ecfdf5] p-5 shadow-sm sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-[#64748b]">عدد المقررات النشطة</p>
            <CountUp
              value={metrics.invoices}
              className="mt-2 block text-[2rem] font-black leading-none text-[#0f172a] sm:text-[2.5rem]"
            />
          </div>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/70">
            <AdminIcon
              src="/images/student/icon-receipt.svg"
              className="size-5 text-[#14b8a6]"
            />
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#bfdbfe] bg-[#eff6ff] p-5 shadow-sm sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-[#64748b]">إجمالي الدخل (MET)</p>
            <CountUp
              value={metrics.totalPayments}
              className="mt-2 block text-[2rem] font-black leading-none text-[#0f172a] sm:text-[2.5rem]"
            />
          </div>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/70">
            <AdminIcon
              src="/images/student/icon-wallet.svg"
              className="size-5 text-[#3b82f6]"
            />
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 text-right">
          <h3 className="text-base font-bold text-[#0f172a]">أداء المقررات</h3>
          <p className="mt-1 text-xs text-[#64748b]">{metrics.revenueGrowthNote}</p>
        </div>

        {metrics.revenueGrowthChart.length === 0 ? (
          <p className="text-right text-sm text-[#64748b]">لا توجد بيانات كافية للرسم البياني.</p>
        ) : (
          <div className="flex items-end justify-between gap-1.5" dir="rtl">
            {metrics.revenueGrowthChart.map((item) => (
              <AnimatedChartBar
                key={item.id}
                value={item.value}
                maxValue={maxValue}
                plotHeight={120}
                minHeight={12}
                className={cn(item.tone === "orange" ? "bg-[#f5a524]" : "bg-[#fde68a]")}
                label={
                  <span className="text-[9px] font-medium text-[#94a3b8] sm:text-[10px]">
                    {item.month}
                  </span>
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
