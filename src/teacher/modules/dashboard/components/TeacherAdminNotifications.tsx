import type { TeacherNotificationItem } from "@/teacher/api";
import { TeacherIcon } from "./TeacherIcon";

interface TeacherAdminNotificationsProps {
  notifications?: TeacherNotificationItem[];
  isLoading?: boolean;
}

export const TeacherAdminNotifications = ({
  notifications = [],
  isLoading,
}: TeacherAdminNotificationsProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-4 text-right text-base font-bold text-[#0f172a]">
        التنبيهات الإدارية
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#64748b]">لا توجد تنبيهات إدارية.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-3 py-2.5"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <TeacherIcon src={item.icon} className={`size-4 ${item.iconColor}`} />
              </span>
              <p className="flex-1 text-right text-sm text-[#475569]">{item.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
