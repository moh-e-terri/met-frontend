import { CountUp, Stagger } from "@/shared/motion";
import type { AdminStatCard } from "@/admin/api";
import { AdminIcon } from "./AdminIcon";

interface AdminStatsCardsProps {
  stats: AdminStatCard[];
  isLoading?: boolean;
}

export const AdminStatsCards = ({ stats, isLoading }: AdminStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="rounded-3xl border border-[#e2e8f0] bg-white px-6 py-10 text-center text-sm text-[#64748b]">
        لا تتوفر إحصائيات حالياً.
      </div>
    );
  }

  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="rtl" staggerMs={80}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-right">
              <p className="text-sm text-[#64748b]">{stat.label}</p>
              <CountUp
                value={stat.value}
                className="mt-2 block text-2xl font-black text-[#0f172a] sm:text-3xl"
              />
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  stat.trendUp
                    ? "bg-[#ecfdf5] text-[#14b8a6]"
                    : "bg-[#fef2f2] text-[#ef4444]"
                }`}
                dir="ltr"
              >
                {stat.trend}
              </span>
            </div>

            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
            >
              <AdminIcon
                src={stat.icon}
                className={`size-5 ${stat.iconColor}`}
              />
            </span>
          </div>
        </div>
      ))}
    </Stagger>
  );
};
