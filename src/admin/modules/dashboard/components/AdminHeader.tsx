import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { getAdminBasePath } from "@/core/routing/appSurface";
import { cn } from "@/shared/utils/cn";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { NotificationToast } from "@/shared/components/NotificationToast";
import { NotificationsPanel } from "@/student/components/NotificationsPanel";
import { ADMIN_DEFAULT_AVATAR } from "@/admin/constants/assets";
import {
  adminHeaderHeightClass,
  ADMIN_NAVBAR_Z_INDEX,
} from "@/admin/constants/layout";
import { AdminIcon } from "./AdminIcon";
import { DashboardIcon } from "@/shared/components/DashboardIcon";

interface AdminHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const AdminHeader = ({
  sidebarOpen,
  onToggleSidebar,
}: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const basePath = getAdminBasePath();
  const displayName = session?.name ?? "مدير النظام";
  const settingsPath = `${basePath}/settings`;
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    handleMarkAllRead,
    handleMarkRead,
    isLoading,
    toast,
    openToast,
    dismissToast,
  } = useNotifications();

  const handleCloseNotifications = useCallback(() => {
    setNotificationsOpen(false);
  }, []);

  return (
    <header
      className="sticky top-0 shrink-0 border-b border-[#e2e8f0] bg-white"
      style={{ zIndex: ADMIN_NAVBAR_Z_INDEX }}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 sm:px-6",
          adminHeaderHeightClass,
        )}
        dir="ltr"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
          <Link
            to={settingsPath}
            className="flex min-w-0 items-center gap-2 rounded-2xl transition-opacity hover:opacity-90 sm:gap-3"
            aria-label="الملف الشخصي"
            title="الملف الشخصي"
          >
            <img
              src={session?.avatar || ADMIN_DEFAULT_AVATAR}
              alt=""
              className="size-9 shrink-0 rounded-full object-cover sm:size-10"
              aria-hidden
            />

            <div className="hidden text-right md:block" dir="rtl">
              <p className="text-sm font-semibold text-[#0f172a]">{displayName}</p>
              <p className="text-xs text-[#64748b]">مدير النظام</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => navigate(settingsPath)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
            aria-label="الإعدادات"
          >
            <AdminIcon
              src="/images/admin/icon-settings.svg"
              className="size-5"
            />
          </button>

          <button
            type="button"
            onClick={() => navigate(`${basePath}/chats`)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
            aria-label="المحادثات"
          >
            <AdminIcon src="/images/student/icon-chat.svg" className="size-5" />
          </button>

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
              <AdminIcon
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
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 px-2 md:block lg:max-w-xl lg:px-6">
          <label className="relative block">
            <span className="sr-only">بحث</span>
            <input
              type="search"
              placeholder="البحث عن مقررات، طلاب، أو معاملات..."
              className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-4 pr-11 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
              dir="rtl"
            />
            <DashboardIcon
              src="/images/student/icon-search.svg"
              className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
            />
          </label>
        </div>

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
            aria-controls="admin-sidebar"
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
        onOpen={openToast}
        onDismiss={dismissToast}
      />
    </header>
  );
};
