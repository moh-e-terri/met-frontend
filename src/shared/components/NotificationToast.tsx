import { cn } from "@/shared/utils/cn";
import type { AppNotification } from "@/core/api/notifications";

interface NotificationToastProps {
  notification: AppNotification | null;
  onOpen: () => void;
  onDismiss: () => void;
}

export const NotificationToast = ({
  notification,
  onOpen,
  onDismiss,
}: NotificationToastProps) => {
  if (!notification) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-[80] w-[min(100vw-2rem,360px)]"
      dir="rtl"
      role="status"
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "w-full rounded-2xl border border-[#f5a524]/40 bg-white p-4 text-right shadow-[0_20px_50px_rgba(15,23,42,0.18)]",
          "transition-transform hover:scale-[1.01]",
        )}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-bold text-[#f5a524]">
            إشعار جديد
          </span>
          <p className="text-sm font-bold text-[#0f172a]">{notification.title}</p>
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-[#64748b]">
          {notification.message}
        </p>
        <p className="mt-2 text-[11px] text-[#94a3b8]">{notification.time}</p>
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 w-full rounded-xl bg-[#0f172a]/80 py-2 text-xs font-semibold text-white"
      >
        إغلاق
      </button>
    </div>
  );
};
