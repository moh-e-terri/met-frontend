import type { TeacherActivityItem } from "@/teacher/api";
import { TeacherIcon } from "./TeacherIcon";

interface TeacherActivitySectionProps {
  activities?: TeacherActivityItem[];
  isLoading?: boolean;
}

export const TeacherActivitySection = ({
  activities = [],
  isLoading,
}: TeacherActivitySectionProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-5 flex items-center justify-start gap-2 text-lg font-bold text-[#0f172a]">
        <TeacherIcon src="/images/student/icon-bell.svg" className="size-5 text-[#f5a524]" />
        <span>أحدث النشاطات</span>
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد نشاطات حديثة.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${activity.iconBg}`}
              >
                <TeacherIcon src={activity.icon} className={`size-4 ${activity.iconColor}`} />
              </span>
              <div className="min-w-0 flex-1 text-right">
                <p className="text-sm leading-6 text-[#475569]">{activity.text}</p>
                <p className="mt-1 text-xs text-[#94a3b8]">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
