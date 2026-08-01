import { useCallback, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import type { AppNotification } from "@/core/api/notifications";
import { NotificationsPanel } from "@/student/components/NotificationsPanel";
import { NotificationToast } from "@/shared/components/NotificationToast";
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
  /** When set, avatar + name navigate to the account profile/settings page */
  profileTo?: string;
  notifications?: AppNotification[];
  unreadCount?: number;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  isNotificationsLoading?: boolean;
  toast?: AppNotification | null;
  onOpenToast?: () => void;
  onDismissToast?: () => void;
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
  profileTo,
  notifications = [],
  unreadCount: unreadCountProp,
  onMarkAllRead,
  onMarkRead,
  isNotificationsLoading,
  toast = null,
  onOpenToast,
  onDismissToast,
}: DashboardHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount =
    typeof unreadCountProp === "number"
      ? unreadCountProp
      : notifications.filter((item) => !item.read).length;

  const handleCloseNotifications = useCallback(() => {
    setNotificationsOpen(false);
  }, []);

  const identity = (
    <>
      <img
        src={avatar}
        alt=""
        className="size-9 shrink-0 rounded-full object-cover sm:size-10"
        aria-hidden
      />

      <div className="hidden text-right md:block" dir="rtl">
        <p className="text-sm font-semibold text-[#0f172a]">{displayName}</p>
        <p className="text-xs text-[#64748b]">{roleSubtitle}</p>
      </div>
    </>
  );

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
          {profileTo ? (
            <Link
              to={profileTo}
              className="flex min-w-0 items-center gap-2 rounded-2xl transition-opacity hover:opacity-90 sm:gap-3"
              aria-label="الملف الشخصي"
              title="الملف الشخصي"
            >
              {identity}
            </Link>
          ) : (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">{identity}</div>
          )}

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
              onClick={() => setNotificationsOpen((open) => !open)}
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
              {unreadCount > 0 ? (
                <span className="absolute left-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-[#f5a524] px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </button>

            <NotificationsPanel
              open={notificationsOpen}
              notifications={notifications}
              onClose={handleCloseNotifications}
              onMarkAllRead={() => onMarkAllRead?.()}
              onMarkRead={(id) => onMarkRead?.(id)}
              isLoading={isNotificationsLoading}
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

      <NotificationToast
        notification={toast}
        onOpen={() => onOpenToast?.()}
        onDismiss={() => onDismissToast?.()}
      />
    </header>
  );
};
