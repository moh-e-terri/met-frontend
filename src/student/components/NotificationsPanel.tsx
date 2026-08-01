import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import type { AppNotification } from "@/core/api/notifications";
import { STUDENT_DROPDOWN_Z_INDEX } from "@/student/constants/layout";
import { StudentIcon } from "../modules/dashboard/components/StudentIcon";

interface NotificationsPanelProps {
  open: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  isLoading?: boolean;
}

const typeIcon: Record<AppNotification["type"], string> = {
  community: "/images/student/icon-community.svg",
  course: "/images/student/icon-book.svg",
  system: "/images/student/icon-bell.svg",
  chat: "/images/student/icon-chat.svg",
  finance: "/images/student/icon-wallet.svg",
};

const PANEL_WIDTH = 360;
const VIEWPORT_GAP = 12;

export const NotificationsPanel = ({
  open,
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
  isLoading,
}: NotificationsPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    const place = () => {
      const anchor = panelRef.current?.parentElement;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
      // Prefer aligning to the trigger's left edge; clamp into the viewport.
      let left = rect.left;
      left = Math.max(VIEWPORT_GAP, Math.min(left, window.innerWidth - width - VIEWPORT_GAP));
      const top = rect.bottom + 8;

      setCoords({ top, left, width });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const anchor = panelRef.current.parentElement;
        if (anchor?.contains(event.target as Node)) return;
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div
      ref={panelRef}
      style={{
        zIndex: STUDENT_DROPDOWN_Z_INDEX,
        ...(coords
          ? {
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }
          : {
              // Fallback before measure — keep on-screen
              position: "fixed",
              top: 73,
              left: VIEWPORT_GAP,
              right: VIEWPORT_GAP,
              width: "auto",
            }),
      }}
      className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
      dir="rtl"
    >
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-xs font-medium text-[#f5a524] transition-colors hover:text-[#e6951f] disabled:opacity-40"
          disabled={unreadCount === 0}
        >
          تعليم الكل كمقروء
        </button>
        <div className="text-right">
          <p className="text-sm font-bold text-[#0f172a]">الإشعارات</p>
          {unreadCount > 0 ? (
            <p className="text-xs text-[#64748b]">{unreadCount} غير مقروء</p>
          ) : (
            <p className="text-xs text-[#94a3b8]">لا جديد</p>
          )}
        </div>
      </div>

      <ul className="max-h-[min(360px,calc(100dvh-6.5rem))] overflow-y-auto">
        {isLoading ? (
          <li className="space-y-2 px-4 py-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-[#f1f5f9]" />
            ))}
          </li>
        ) : notifications.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-[#64748b]">
            لا توجد إشعارات حالياً.
          </li>
        ) : (
          notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => {
                  onMarkRead(notification.id);
                  onClose();
                }}
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
                    <span className="shrink-0 text-[11px] text-[#94a3b8]">
                      {notification.time}
                    </span>
                    <span className="min-w-0 truncate text-sm font-semibold text-[#0f172a]">
                      {notification.title}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-xs leading-5 text-[#64748b]">
                    {notification.message}
                  </p>
                </div>

                {!notification.read ? (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-[#f5a524]" />
                ) : null}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
