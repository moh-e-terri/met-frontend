import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { cn } from "@/shared/utils/cn";
import {
  STUDENT_HEADER_HEIGHT,
  STUDENT_SIDEBAR_Z_INDEX,
  studentSidebarHeightClass,
  studentSidebarLayerClass,
  studentSidebarTopClass,
} from "@/student/constants/layout";
import { fetchMyCoursesCatalog, myCoursesQueryKeys } from "@/student/api/myCourses";
import { StudentIcon } from "./StudentIcon";

const mainLinks = [
  {
    label: "لوحة التحكم",
    to: "/student",
    icon: "/images/student/icon-dashboard.svg",
  },
  {
    label: "استكشاف المقررات",
    to: "/student/catalog",
    icon: "/images/student/icon-search.svg",
  },
  {
    label: "دوراتي",
    to: "/student/my-courses",
    icon: "/images/student/icon-book.svg",
  },
  {
    label: "محفظتي",
    to: "/student/payments",
    icon: "/images/student/icon-payment.svg",
  },
  {
    label: "المحادثات",
    to: "/student/chats",
    icon: "/images/student/icon-chat.svg",
  },
  {
    label: "المجتمع العام",
    to: "/student/community",
    icon: "/images/student/icon-community.svg",
  },
  {
    label: "إعدادات الحساب",
    to: "/student/settings",
    icon: "/images/admin/icon-settings.svg",
  },
];

interface StudentSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const StudentSidebar = ({ open, onClose }: StudentSidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut, session } = useAuth();

  const coursesQuery = useQuery({
    queryKey: myCoursesQueryKeys.catalog(session?.userId),
    queryFn: fetchMyCoursesCatalog,
    enabled: Boolean(session?.userId),
  });

  const enrolledCourses = coursesQuery.data?.courses.map((course, index) => ({
    id: course.id,
    title: course.title,
    dot: ["bg-[#22c55e]", "bg-[#f5a524]", "bg-[#3b82f6]"][index % 3],
  })) ?? [];

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

  return (
    <aside
      id="student-sidebar"
      style={{ zIndex: STUDENT_SIDEBAR_Z_INDEX }}
      className={cn(
        "fixed right-0 flex w-64 flex-col border-l border-[#e2e8f0] bg-white transition-transform duration-300 ease-in-out",
        studentSidebarTopClass,
        studentSidebarHeightClass,
        studentSidebarLayerClass,
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ paddingTop: STUDENT_HEADER_HEIGHT }}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-8">
            <div>
              <p className="mb-4 px-3 text-right text-xs font-semibold text-[#94a3b8]">
                الرئيسية
              </p>
              <nav className="space-y-1">
                {mainLinks.map((link) => {
                  const active =
                    link.to === "/student"
                      ? pathname === "/student"
                      : pathname.startsWith(link.to);

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#fff7ed] text-[#f5a524]"
                          : "text-[#475569] hover:bg-[#f8fafc]",
                      )}
                    >
                      <StudentIcon
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
                {enrolledCourses.length === 0 ? (
                  <p className="px-3 py-2 text-right text-xs text-[#94a3b8]">
                    لا توجد دورات مسجّلة
                  </p>
                ) : (
                  enrolledCourses.map((course) => {
                  const active =
                    pathname === `/student/my-courses/${course.id}` ||
                    (pathname === "/student/my-courses" && course.id === enrolledCourses[0]?.id);

                  return (
                    <Link
                      key={course.id}
                      to={`/student/my-courses/${course.id}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[#fff7ed] font-medium text-[#f5a524]"
                          : "text-[#475569] hover:bg-[#f8fafc]",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 shrink-0 rounded-full",
                          course.dot,
                        )}
                      />
                      <span className="flex-1 truncate text-right">
                        {course.title}
                      </span>
                    </Link>
                  );
                })
                )}
              </nav>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#e2e8f0] bg-white p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5a524] px-4 py-2.5 text-sm font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-colors hover:bg-[#e6951f]"
          >
            <StudentIcon
              src="/images/student/icon-logout.svg"
              className="size-[11px] text-white"
            />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
