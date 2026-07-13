import { CountUp, Stagger } from "@/shared/motion";
import type { StudentDashboardStats } from "@/student/api";
import { StudentIcon } from "./StudentIcon";

const statConfig = [
  {
    key: "enrolled" as const,
    label: "الدورات المسجلة",
    icon: "/images/student/icon-book.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
  {
    key: "completed" as const,
    label: "الدورات المكتملة",
    icon: "/images/student/icon-check.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  },
  {
    key: "inProgress" as const,
    label: "قيد الإنجاز",
    icon: "/images/student/icon-clock.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#0ea5e9]",
  },
];

interface StatsCardsProps {
  stats?: StudentDashboardStats;
  isLoading?: boolean;
}

export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerMs={80}>
      {statConfig.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
        >
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
          >
            <StudentIcon
              src={stat.icon}
              className={`size-5 ${stat.iconColor}`}
            />
          </div>

          <div className="min-w-0 flex-1 text-right">
            <p className="text-sm text-[#64748b]">{stat.label}</p>
            {isLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-[#e2e8f0]" />
            ) : (
              <CountUp
                value={String(stats?.[stat.key] ?? 0)}
                className="mt-1 block text-3xl font-black text-[#0f172a]"
              />
            )}
          </div>
        </div>
      ))}
    </Stagger>
  );
};
