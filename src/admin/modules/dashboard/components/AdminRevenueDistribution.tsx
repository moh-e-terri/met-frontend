import type { RevenueDistributionItem } from "@/admin/api";
import { cn } from "@/shared/utils/cn";
import { AdminIcon } from "./AdminIcon";

interface AdminRevenueDistributionProps {
  items: RevenueDistributionItem[];
  isLoading?: boolean;
}

export const AdminRevenueDistribution = ({
  items,
  isLoading,
}: AdminRevenueDistributionProps) => {
  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-6 text-right">
        <h2 className="text-lg font-bold text-[#0f172a]">توزيع الإيرادات</h2>
        <p className="mt-1 text-sm text-[#64748b]">بيانات مالية مباشرة من المنصة</p>
      </div>

      {items.length === 0 ? (
        <p className="text-right text-sm text-[#64748b]">لا توجد بيانات مالية بعد.</p>
      ) : (
        <ul className="space-y-5">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-[#0f172a]">{item.label}</span>
                <span className="font-bold tabular-nums text-[#64748b]">{item.percentage}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#f1f5f9]">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700", item.barClass)}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-right text-xs text-[#64748b]">{item.amount}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#fffbeb] px-4 py-3">
        <AdminIcon
          src="/images/student/icon-info.svg"
          className="mt-0.5 size-4 shrink-0 text-[#f5a524]"
        />
        <p className="text-right text-sm leading-6 text-[#92400e]">
          الأرقام محسوبة من إجمالي الدخل والمحتجز وصافي أرباح المنصة.
        </p>
      </div>
    </section>
  );
};
