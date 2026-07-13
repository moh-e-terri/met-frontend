import type { AdminActivity } from "../data/mockAdminDashboard";
import { AdminIcon } from "./AdminIcon";

const activityIcons = {
  request: {
    icon: "/images/teacher/icon-user-join.svg",
    iconBg: "bg-[#fff7ed]",
    iconColor: "text-[#f5a524]",
  },
  publish: {
    icon: "/images/student/icon-book.svg",
    iconBg: "bg-[#eff6ff]",
    iconColor: "text-[#3b82f6]",
  },
  enrollment: {
    icon: "/images/student/icon-groups.svg",
    iconBg: "bg-[#ecfdf5]",
    iconColor: "text-[#14b8a6]",
  },
};

interface AdminActivitiesSectionProps {
  activities: AdminActivity[];
  isLoading?: boolean;
}

export const AdminActivitiesSection = ({
  activities,
  isLoading,
}: AdminActivitiesSectionProps) => {
  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#0f172a]">آخر النشاطات</h2>
      </div>

      {activities.length === 0 ? (
        <p className="text-right text-sm text-[#64748b]">لا توجد نشاطات حديثة لعرضها.</p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => {
            const visual = activityIcons[activity.type];

            return (
              <li
                key={activity.id}
                className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${visual.iconBg}`}
                  >
                    <AdminIcon
                      src={visual.icon}
                      className={`size-4 ${visual.iconColor}`}
                    />
                  </span>

                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-sm font-bold text-[#0f172a]">{activity.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#64748b]">
                      {activity.description}
                    </p>
                    <p className="mt-2 text-xs text-[#94a3b8]">{activity.time}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
