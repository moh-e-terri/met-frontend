import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { getAdminBasePath } from "@/core/routing/appSurface";
import { cn } from "@/shared/utils/cn";
import {
  ADMIN_HEADER_HEIGHT,
  ADMIN_SIDEBAR_Z_INDEX,
  adminSidebarHeightClass,
  adminSidebarLayerClass,
  adminSidebarTopClass,
} from "@/admin/constants/layout";
import { AdminIcon } from "./AdminIcon";

const mainLinks = [
  {
    label: "لوحة القيادة",
    to: "",
    icon: "/images/student/icon-dashboard.svg",
  },
  {
    label: "المقررات",
    to: "courses",
    icon: "/images/student/icon-book.svg",
  },
  {
    label: "المحاضرون",
    to: "lecturers",
    icon: "/images/student/icon-active-user.svg",
  },
  {
    label: "بيانات المنصة",
    to: "overview",
    icon: "/images/student/icon-dashboard.svg",
  },
  {
    label: "الطلاب",
    to: "students",
    icon: "/images/student/icon-groups.svg",
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
    label: "المالية",
    to: "financials",
    icon: "/images/student/icon-wallet.svg",
  },
  {
    label: "إعدادات الحساب",
    to: "settings",
    icon: "/images/admin/icon-settings.svg",
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ open, onClose }: AdminSidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const basePath = getAdminBasePath();

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
      id="admin-sidebar"
      style={{ zIndex: ADMIN_SIDEBAR_Z_INDEX }}
      className={cn(
        "fixed right-0 flex w-64 flex-col border-l border-[#e2e8f0] bg-white transition-transform duration-300 ease-in-out",
        adminSidebarTopClass,
        adminSidebarHeightClass,
        adminSidebarLayerClass,
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{ paddingTop: ADMIN_HEADER_HEIGHT }}
      >
        <div className="border-b border-[#f1f5f9] px-5 py-4">
          <img
            src="/images/logo.svg"
            alt="MET"
            className="mx-auto h-9 w-[65px] object-contain"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
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
                  <AdminIcon
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

        <div className="shrink-0 space-y-3 border-t border-[#f1f5f9] bg-white p-4">
          <Link
            to={`${basePath}/courses#create-course-form`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f5a524] px-4 py-2.5 text-sm font-semibold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-colors hover:bg-[#e6951f]"
          >
            <AdminIcon
              src="/images/student/icon-add.svg"
              className="size-4 text-white"
            />
            <span>إضافة مقرر جديد</span>
          </Link>

          <Link
            to={`${basePath}/support`}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#475569]"
          >
            <AdminIcon
              src="/images/student/icon-question.svg"
              className="size-4 shrink-0"
            />
            <span className="flex-1 text-right">الدعم الفني</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-[#64748b] transition-colors hover:bg-[#f8fafc] hover:text-[#475569]"
          >
            <AdminIcon
              src="/images/student/icon-logout.svg"
              className="size-4 shrink-0"
            />
            <span className="flex-1 text-right">تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
