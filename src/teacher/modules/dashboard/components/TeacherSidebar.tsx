import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { cn } from "@/shared/utils/cn";
import {
  TEACHER_HEADER_HEIGHT,
  TEACHER_SIDEBAR_Z_INDEX,
  teacherSidebarHeightClass,
  teacherSidebarLayerClass,
  teacherSidebarTopClass,
} from "@/teacher/constants/layout";
import { fetchInstructorDashboard, teacherQueryKeys } from "@/teacher/api";
import { TeacherIcon } from "./TeacherIcon";

const mainLinks = [
  {
    label: "لوحة التحكم",
    to: "",
    icon: "/images/student/icon-dashboard.svg",
  },
  {
    label: "الداشبورد المالي",
    to: "payments",
    icon: "/images/student/icon-payment.svg",
  },
  {
    label: "المحادثات",
    to: "chats",
    icon: "/images/student/icon-chat.svg",
  },
  {
    label: "المجتمع العام",
    to: "community",
    icon: "/images/student/icon-community.svg",
  },
  {
    label: "إعدادات الحساب",
    to: "settings",
    icon: "/images/admin/icon-settings.svg",
  },
];

interface TeacherSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const TeacherSidebar = ({ open, onClose }: TeacherSidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuth();
  const basePath = getTeacherBasePath();

  const dashboardQuery = useQuery({
    queryKey: teacherQueryKeys.dashboard,
    queryFn: fetchInstructorDashboard,
    enabled: Boolean(session),
  });

  const sidebarCourses = dashboardQuery.data?.courses ?? [];

  useEffect(() => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  }, [pathname, onClose]);

  const handleLogout = () => {
    signOut();
    navigate("/signin");
  };

  if (!open) {
    return null;
  }

  const homePath = basePath || "/";

  return (
    <aside
      id="teacher-sidebar"
      style={{ zIndex: TEACHER_SIDEBAR_Z_INDEX }}
      className={cn(
        "fixed right-0 flex w-64 flex-col border-l border-[#e2e8f0] bg-white transition-transform duration-300 ease-in-out",
        teacherSidebarTopClass,
        teacherSidebarHeightClass,
        teacherSidebarLayerClass,
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ paddingTop: TEACHER_HEADER_HEIGHT }}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-8">
            <div>
              <p className="mb-4 px-3 text-right text-xs font-semibold text-[#94a3b8]">
                الرئيسية
              </p>
              <nav className="space-y-1">
                {mainLinks.map((link) => {
                  const href = link.to ? `${basePath}/${link.to}` : homePath;
                  const active =
                    link.to === ""
                      ? pathname === homePath || pathname === `${homePath}/`
                      : pathname.startsWith(`${basePath}/${link.to}`);

                  return (
                    <Link
                      key={link.label}
                      to={href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "border-r-4 border-[#f5a524] bg-[#fff7ed] text-[#f5a524]"
                          : "text-[#475569] hover:bg-[#f8fafc]",
                      )}
                    >
                      <TeacherIcon
                        src={link.icon}
                        className={cn(
                          "size-[18px] shrink-0",
                          active ? "text-[#f5a524]" : "text-[#64748b]",
                        )}
                      />
                      <span className="flex-1 text-right">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="mb-4 px-3 text-right text-xs font-semibold text-[#94a3b8]">
                دوراتي الحالية
              </p>
              <nav className="space-y-1">
                {sidebarCourses.length === 0 ? (
                  <p className="px-3 py-2 text-right text-xs text-[#94a3b8]">
                    لا توجد دورات
                  </p>
                ) : (
                  sidebarCourses.map((course, index) => {
                    const coursePath = `${basePath}/courses/${course.id}`;
                    const active = pathname.startsWith(coursePath);

                    return (
                      <Link
                        key={course.id}
                        to={coursePath}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                          active
                            ? "font-medium text-[#f5a524]"
                            : "text-[#475569] hover:bg-[#f8fafc]",
                        )}
                      >
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            index % 2 === 0 ? "bg-[#f5a524]" : "bg-[#3b82f6]",
                          )}
                        />
                        <span className="flex-1 truncate text-right">{course.title}</span>
                      </Link>
                    );
                  })
                )}
              </nav>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#f1f5f9] bg-white p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5a524] px-4 py-2.5 text-sm font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-colors hover:bg-[#e6951f]"
          >
            <TeacherIcon src="/images/student/icon-logout.svg" className="size-[11px] text-white" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
