import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/shared/utils/cn";
import {
  teacherLayoutVars,
  teacherOverlayTopClass,
  TEACHER_OVERLAY_Z_INDEX,
} from "../constants/layout";
import { TeacherHeader } from "../modules/dashboard/components/TeacherHeader";
import { TeacherSidebar } from "../modules/dashboard/components/TeacherSidebar";

const LG_BREAKPOINT = 1024;

export const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`).matches,
  );

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);

    const handleChange = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || window.innerWidth >= LG_BREAKPOINT) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div
      dir="rtl"
      className={cn("min-h-screen bg-[#f8f7f5]", teacherLayoutVars)}
    >
      <TeacherSidebar open={sidebarOpen} onClose={closeSidebar} />

      {sidebarOpen && (
        <button
          type="button"
          style={{ zIndex: TEACHER_OVERLAY_Z_INDEX }}
          className={cn(
            "fixed bg-black/40 lg:hidden",
            teacherOverlayTopClass,
          )}
          aria-label="إغلاق القائمة"
          onClick={closeSidebar}
        />
      )}

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out",
          sidebarOpen && "lg:mr-64",
        )}
      >
        <TeacherHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
