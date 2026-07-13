import type { TeacherFinanceChartPoint } from "@/teacher/api";
import { cn } from "@/shared/utils/cn";
import { useMemo, useState } from "react";
import { AnimatedChartBar } from "@/shared/motion";

interface TeacherEarningsChartProps {
  chartMonthly?: TeacherFinanceChartPoint[];
  chartWeekly?: TeacherFinanceChartPoint[];
  isLoading?: boolean;
}

export const TeacherEarningsChart = ({
  chartMonthly = [],
  chartWeekly = [],
  isLoading,
}: TeacherEarningsChartProps) => {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");

  const chartData = period === "monthly" ? chartMonthly : chartWeekly;

  const maxValue = useMemo(
    () => Math.max(...chartData.map((item) => item.value), 1),
    [chartData],
  );

  if (isLoading) {
    return <div className="h-80 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="text-right">
          <h2 className="text-lg font-bold text-[#0f172a]">نظرة عامة على الأرباح</h2>
          <p className="mt-1 text-sm text-[#64748b]">تتبع أدائك بمرور الوقت</p>
        </div>

        <div className="flex shrink-0 self-start rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-1">
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              period === "weekly"
                ? "bg-white text-[#0f172a] shadow-sm"
                : "text-[#64748b]",
            )}
          >
            أسبوعي
          </button>
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
              period === "monthly"
                ? "bg-[#f5a524] text-white shadow-sm"
                : "text-[#64748b]",
            )}
          >
            شهري
          </button>
        </div>
      </div>

      <div className="my-5 border-t border-[#f1f5f9]" />

      {chartData.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#64748b]">
          لا توجد بيانات أرباح كافية لعرض المخطط بعد.
        </p>
      ) : (
        <div
          className="flex items-end justify-between gap-1.5 sm:gap-3"
          dir="rtl"
          role="img"
          aria-label="مخطط الأرباح"
        >
          {chartData.map((item) => (
            <AnimatedChartBar
              key={`${period}-${item.label}`}
              value={item.value}
              maxValue={maxValue}
              active={item.active}
              tooltip={
                item.active ? (
                  <div className="whitespace-nowrap rounded-lg bg-[#0f172a] px-2.5 py-1 text-[10px] font-semibold text-white shadow-md">
                    Current: {item.amount}
                  </div>
                ) : undefined
              }
              label={
                <span
                  className={cn(
                    "mt-3 text-[10px] font-medium sm:text-xs",
                    item.active ? "font-bold text-[#f5a524]" : "text-[#64748b]",
                  )}
                >
                  {item.label}
                </span>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
};
