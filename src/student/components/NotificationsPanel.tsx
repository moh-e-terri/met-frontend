import { useEffect, useRef } from "react";
import { cn } from "@/shared/utils/cn";
import { STUDENT_DROPDOWN_Z_INDEX } from "@/student/constants/layout";
import type { StudentNotification } from "@/student/data/notifications";
import { StudentIcon } from "../modules/dashboard/components/StudentIcon";

interface NotificationsPanelProps {
  open: boolean;
  notifications: StudentNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

const typeIcon: Record<StudentNotification["type"], string> = {
  community: "/images/student/icon-community.svg",
  course: "/images/student/icon-book.svg",
  system: "/images/student/icon-bell.svg",
};

export const NotificationsPanel = ({
  open,
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
}: NotificationsPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div
      ref={panelRef}
      style={{ zIndex: STUDENT_DROPDOWN_Z_INDEX }}
      className="absolute left-0 top-[calc(100%+8px)] w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-xs font-medium text-[#f5a524] transition-colors hover:text-[#e6951f]"
          disabled={unreadCount === 0}
        >
          تعليم الكل كمقروء
        </button>
        <div className="text-right">
          <p className="text-sm font-bold text-[#0f172a]">الإشعارات</p>
          {unreadCount > 0 && (
            <p className="text-xs text-[#64748b]">{unreadCount} غير مقروء</p>
          )}
        </div>
      </div>

      <ul className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-[#64748b]">
            لا توجد إشعارات حالياً.
          </li>
        ) : (
          notifications.map((notification) => (
          <li key={notification.id}>
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-[#f8fafc] px-4 py-3 text-right transition-colors hover:bg-[#f8fafc]",
                !notification.read && "bg-[#fffaf3]",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                  notification.read ? "bg-[#f8fafc]" : "bg-[#fff7ed]",
                )}
              >
                <StudentIcon
                  src={typeIcon[notification.type]}
                  className={cn(
                    "size-4",
                    notification.read ? "text-[#94a3b8]" : "text-[#f5a524]",
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#94a3b8]">
                    {notification.time}
                  </span>
                  <span className="text-sm font-semibold text-[#0f172a]">
                    {notification.title}
                  </span>
                </div>
                <p className="text-xs leading-5 text-[#64748b]">
                  {notification.message}
                </p>
              </div>

              {!notification.read && (
                <span className="mt-2 size-2 shrink-0 rounded-full bg-[#f5a524]" />
              )}
            </button>
          </li>
        ))
        )}
      </ul>
    </div>
  );
};
