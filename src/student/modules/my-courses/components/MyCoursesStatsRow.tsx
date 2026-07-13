import { CountUp } from "@/shared/motion";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { StudentDashboardStats } from "@/student/api/types";

const statItems = [
  {
    key: "enrolled" as const,
    label: "دورات مسجّلة",
    icon: "/images/student/icon-book.svg",
    accent: "bg-[#fff7ed] text-[#f5a524]",
  },
  {
    key: "inProgress" as const,
    label: "قيد التقدّم",
    icon: "/images/student/icon-play.svg",
    accent: "bg-[#eff6ff] text-[#3b82f6]",
  },
  {
    key: "completed" as const,
    label: "مكتملة",
    icon: "/images/student/icon-check.svg",
    accent: "bg-[#ecfdf5] text-[#14b8a6]",
  },
];

interface MyCoursesStatsRowProps {
  stats?: StudentDashboardStats;
  isLoading?: boolean;
}

export const MyCoursesStatsRow = ({ stats, isLoading }: MyCoursesStatsRowProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" dir="rtl">
      {statItems.map((item) => (
        <article
          key={item.key}
          className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-[#94a3b8]">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-[#0f172a]" dir="ltr">
                {isLoading ? (
                  <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-[#e2e8f0]" />
                ) : (
                  <CountUp value={String(stats?.[item.key] ?? 0)} />
                )}
              </p>
            </div>
            <span
              className={`flex size-11 items-center justify-center rounded-2xl ${item.accent}`}
            >
              <StudentIcon src={item.icon} className="size-5" />
            </span>
          </div>
        </article>
      ))}
    </div>
  );
};
