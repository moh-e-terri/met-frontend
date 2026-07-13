import type { ReactNode } from "react";
import { AnimatedBar, CountUp } from "@/shared/motion";
import { AdminIcon } from "../../dashboard/components/AdminIcon";

interface PartitionItem {
  label: string;
  percentage: number;
  barClass: string;
}

interface StatBlockProps {
  label: string;
  value: string;
  badge: ReactNode;
  className?: string;
}

const StatBlock = ({ label, value, badge, className = "" }: StatBlockProps) => {
  return (
    <div className={`px-1 py-6 sm:py-2 ${className}`}>
      <div className="flex items-end justify-between gap-4" dir="rtl">
        <div className="min-w-0 text-right">
          <p className="mb-2 text-sm font-medium text-[#64748b]">{label}</p>
          <CountUp
            value={value}
            className="block text-[2.75rem] font-black leading-[0.95] tracking-tight text-[#0f172a] sm:text-[3.5rem]"
          />
        </div>
        <div className="shrink-0 pb-1">{badge}</div>
      </div>
    </div>
  );
};

export const AdminCoursesStatsCards = ({
  activeCourses = 0,
  totalEnrollments = 0,
  partition = [],
}: {
  activeCourses?: number;
  totalEnrollments?: number;
  partition?: PartitionItem[];
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" dir="ltr">
      <div
        className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8"
        dir="rtl"
      >
        <div className="divide-y divide-[#f1f5f9] sm:grid sm:grid-cols-2 sm:divide-y-0">
          <StatBlock
            label="إجمالي الدورات النشطة"
            value={String(activeCourses)}
            badge={
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#ecfdf5] px-3 py-1.5 text-xs font-bold text-[#14b8a6]"
                dir="ltr"
              >
                <AdminIcon
                  src="/images/student/icon-trending.svg"
                  className="size-3.5 text-[#14b8a6]"
                />
                من API
              </span>
            }
            className="sm:pl-6"
          />

          <StatBlock
            label="إجمالي التسجيلات"
            value={String(totalEnrollments)}
            badge={
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fff7ed] px-3 py-1.5 text-xs font-bold text-[#f5a524]"
                dir="ltr"
              >
                طلاب
                <AdminIcon
                  src="/images/student/icon-groups.svg"
                  className="size-3.5 text-[#f5a524]"
                />
              </span>
            }
            className="sm:border-r sm:border-[#f1f5f9] sm:pr-6"
          />
        </div>
      </div>

      <div
        className="rounded-3xl bg-gradient-to-br from-[#f5a524] to-[#e6951f] p-5 text-white shadow-sm sm:p-6"
        dir="rtl"
      >
        <h2 className="text-lg font-bold">إطار تقسيم الإيرادات</h2>
        <p className="mt-2 text-sm leading-6 text-white/85">
          متوسط نسب التقسيم من المقررات الحالية على المنصة.
        </p>

        {partition.length === 0 ? (
          <p className="mt-5 text-sm text-white/85">لا توجد بيانات تقسيم بعد.</p>
        ) : (
          <ul className="mt-5 space-y-4">
            {partition.map((item) => (
              <li key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{item.label}</span>
                  <CountUp value={`${item.percentage}%`} className="font-bold" />
                </div>
                <AnimatedBar
                  value={item.percentage}
                  className="h-2 bg-white/20"
                  barClassName={item.barClass}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
