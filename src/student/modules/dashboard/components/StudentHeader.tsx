import { useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { DashboardHeader } from "@/shared/components/DashboardHeader";
import { DashboardIcon } from "@/shared/components/DashboardIcon";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";
import {
  studentHeaderHeightClass,
  STUDENT_NAVBAR_Z_INDEX,
} from "@/student/constants/layout";

interface StudentHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const StudentHeader = ({
  sidebarOpen,
  onToggleSidebar,
}: StudentHeaderProps) => {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const displayName = session?.name?.split(" ")[0] ?? "طالب";
  const isCommunityPage = pathname.includes("/community");
  const isChatsPage = pathname.includes("/chats");
  const isMyCoursesPage = pathname.includes("/my-courses");

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

  if (isCommunityPage || isMyCoursesPage) {
    centerContent = (
      <div className="hidden min-w-0 flex-1 px-2 md:block lg:max-w-xl lg:px-6">
        <label className="relative block">
          <span className="sr-only">
            {isMyCoursesPage
              ? "بحث عن كورسات أو زملاء"
              : "بحث في المجتمع"}
          </span>
          <input
            type="search"
            placeholder={
              isMyCoursesPage
                ? "بحث عن كورسات أو زملاء..."
                : "بحث في المجتمع..."
            }
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
        <h1
          className="text-base font-bold text-[#0f172a] sm:text-lg"
          dir="rtl"
        >
          مركز الرسائل
        </h1>
      </div>
    );
  }

  return (
    <DashboardHeader
      avatar={session?.avatar || STUDENT_DEFAULT_AVATAR}
      displayName={displayName}
      roleSubtitle="طالب"
      sidebarId="student-sidebar"
      sidebarOpen={sidebarOpen}
      onToggleSidebar={onToggleSidebar}
      headerHeightClass={studentHeaderHeightClass}
      navbarZIndex={STUDENT_NAVBAR_Z_INDEX}
      centerContent={centerContent}
      messagesTo="/student/chats"
      profileTo="/student/settings"
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
