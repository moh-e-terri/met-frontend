import { useAuth } from "@/core/auth/AuthContext";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { DashboardHeader } from "@/shared/components/DashboardHeader";
import { DashboardIcon } from "@/shared/components/DashboardIcon";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { resolveAccountAvatar } from "@/shared/utils/accountAvatar";
import {
  teacherHeaderHeightClass,
  TEACHER_NAVBAR_Z_INDEX,
} from "@/teacher/constants/layout";
import { useLocation } from "react-router-dom";

interface TeacherHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const TeacherHeader = ({
  sidebarOpen,
  onToggleSidebar,
}: TeacherHeaderProps) => {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const displayName = session?.name ?? "مدرّس";
  const basePath = getTeacherBasePath();
  const isCommunityPage = pathname.includes("/community");
  const isChatsPage = pathname.includes("/chats");

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

  let centerContent = null;

  if (isCommunityPage) {
    centerContent = (
      <div className="hidden min-w-0 flex-1 px-2 md:block lg:max-w-xl lg:px-6">
        <label className="relative block">
          <span className="sr-only">بحث في مجتمع المدربين</span>
          <input
            type="search"
            placeholder="بحث في مجتمع المدربين..."
            className="w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-4 pr-11 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
            dir="rtl"
          />
          <DashboardIcon
            src="/images/student/icon-search.svg"
            className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
          />
        </label>
      </div>
    );
  } else if (isChatsPage) {
    centerContent = (
      <div className="hidden min-w-0 flex-1 px-2 md:flex md:justify-center lg:px-6">
        <h1 className="text-base font-bold text-[#0f172a] sm:text-lg" dir="rtl">
          مركز الرسائل
        </h1>
      </div>
    );
  }

  return (
    <DashboardHeader
      avatar={resolveAccountAvatar(session)}
      displayName={displayName}
      roleSubtitle="مدرّس معتمد"
      sidebarId="teacher-sidebar"
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      headerHeightClass={teacherHeaderHeightClass}
      navbarZIndex={TEACHER_NAVBAR_Z_INDEX}
      centerContent={centerContent}
      messagesTo={`${basePath}/chats`}
      profileTo={`${basePath}/settings`}
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAllRead={handleMarkAllRead}
      onMarkRead={handleMarkRead}
      isNotificationsLoading={isLoading}
      toast={toast}
      onOpenToast={openToast}
      onDismissToast={dismissToast}
    />
  );
};
