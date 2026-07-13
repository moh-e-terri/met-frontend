import type { TeacherStatItem } from "@/teacher/api";
import { CountUp, Stagger } from "@/shared/motion";
import { TeacherIcon } from "./TeacherIcon";

interface TeacherStatsCardsProps {
  stats?: TeacherStatItem[];
  isLoading?: boolean;
}

export const TeacherStatsCards = ({ stats = [], isLoading }: TeacherStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        ))}
      </div>
    );
  }

  return (
    <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="rtl" staggerMs={80}>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between gap-4 rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
        >
          <div className="text-right">
            <p className="text-sm text-[#64748b]">{stat.label}</p>
            <CountUp
              value={stat.value}
              className="mt-1 block text-3xl font-black text-[#0f172a]"
            />
          </div>

          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
          >
            <TeacherIcon src={stat.icon} className={`size-5 ${stat.iconColor}`} />
          </div>
        </div>
      ))}
    </Stagger>
  );
};
