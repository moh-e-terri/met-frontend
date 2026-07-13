import { useCallback, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import { initialNotifications, type StudentNotification } from "@/student/data/notifications";
import { NotificationsPanel } from "@/student/components/NotificationsPanel";
import { DashboardIcon } from "./DashboardIcon";

interface DashboardHeaderProps {
  avatar: string;
  displayName: string;
  roleSubtitle: string;
  sidebarId: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  headerHeightClass: string;
  navbarZIndex: number;
  centerContent?: ReactNode;
  messagesTo?: string;
  notifications?: StudentNotification[];
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
}

export const DashboardHeader = ({
  avatar,
  displayName,
  roleSubtitle,
  sidebarId,
  sidebarOpen,
  onToggleSidebar,
  headerHeightClass,
  navbarZIndex,
  centerContent,
  messagesTo,
  notifications: externalNotifications,
  onMarkAllRead: externalMarkAllRead,
  onMarkRead: externalMarkRead,
}: DashboardHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(initialNotifications);

  const notifications = externalNotifications ?? localNotifications;
  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleToggleNotifications = () => {
    setNotificationsOpen((open) => !open);
  };

  const handleCloseNotifications = useCallback(() => {
    setNotificationsOpen(false);
  }, []);

  const handleMarkAllRead = () => {
    if (externalMarkAllRead) {
      externalMarkAllRead();
      return;
    }

    setLocalNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const handleMarkRead = (id: string) => {
    if (externalMarkRead) {
      externalMarkRead(id);
      return;
    }

    setLocalNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  return (
    <header
      className="sticky top-0 shrink-0 border-b border-[#e2e8f0] bg-white"
      style={{ zIndex: navbarZIndex }}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 sm:px-6",
          headerHeightClass,
        )}
        dir="ltr"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
          <img
            src={avatar}
            alt=""
            className="size-9 shrink-0 rounded-full sm:size-10"
            aria-hidden
          />

          <div className="hidden text-right md:block" dir="rtl">
            <p className="text-sm font-semibold text-[#0f172a]">{displayName}</p>
            <p className="text-xs text-[#64748b]">{roleSubtitle}</p>
          </div>

          {messagesTo ? (
            <Link
              to={messagesTo}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
              aria-label="الرسائل"
            >
              <DashboardIcon
                src="/images/student/icon-message.svg"
                className="size-5"
              />
            </Link>
          ) : (
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
              aria-label="الرسائل"
            >
              <DashboardIcon
                src="/images/student/icon-message.svg"
                className="size-5"
              />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]",
                notificationsOpen &&
                  "border-[#f5a524]/30 bg-[#fff7ed] text-[#f5a524]",
              )}
              aria-label="الإشعارات"
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
            >
              <DashboardIcon
                src="/images/student/icon-bell.svg"
                className="size-4"
              />
              {unreadCount > 0 && (
                <span className="absolute left-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-[#f5a524] px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <NotificationsPanel
              open={notificationsOpen}
              notifications={notifications}
              onClose={handleCloseNotifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />
          </div>
        </div>

        {centerContent}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <img
            src="/images/logo.svg"
            alt="MET"
            className="h-8 w-[58px] object-contain sm:h-9 sm:w-[65px]"
          />

          <button
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] text-[#475569] transition-colors hover:bg-[#f8fafc]",
              sidebarOpen && "border-[#f5a524]/30 bg-[#fff7ed] text-[#f5a524]",
            )}
            aria-label={sidebarOpen ? "إخفاء القائمة" : "إظهار القائمة"}
            aria-expanded={sidebarOpen}
            aria-controls={sidebarId}
          >
            <DashboardIcon
              src="/images/student/icon-menu.svg"
              className="size-[18px]"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
