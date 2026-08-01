import type { TeacherFinanceStat } from "@/teacher/api";
import { CountUp, Stagger } from "@/shared/motion";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface TeacherPaymentStatsCardsProps {
  stats?: TeacherFinanceStat[];
  isLoading?: boolean;
}

export const TeacherPaymentStatsCards = ({
  stats = [],
  isLoading,
}: TeacherPaymentStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        ))}
      </div>
    );
  }

  return (
    <Stagger className="grid gap-4 sm:grid-cols-3" dir="rtl" staggerMs={80}>
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
                className="mt-2 block text-2xl font-black text-[#0f172a]"
              />
              {stat.badge ? (
                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${stat.badgeClassName ?? "bg-[#f8fafc] text-[#64748b]"}`}
                  dir="ltr"
                >
                  {stat.badge}
                </span>
              ) : null}
            </div>
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
            >
              <TeacherIcon src={stat.icon} className={`size-5 ${stat.iconColor}`} />
            </span>
          </div>
        </div>
      ))}
    </Stagger>
  );
};
