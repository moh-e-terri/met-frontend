import { Link } from "react-router-dom";
import type { FeaturedCourseReport } from "@/admin/api";
import { AdminIcon } from "./AdminIcon";

interface AdminFeaturedReportProps {
  course?: FeaturedCourseReport | null;
  isLoading?: boolean;
}

export const AdminFeaturedReport = ({ course, isLoading }: AdminFeaturedReportProps) => {
  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  if (!course) {
    return (
      <section
        className="rounded-3xl border border-[#e2e8f0] bg-white p-6 text-right shadow-sm"
        dir="rtl"
      >
        <h2 className="text-lg font-bold text-[#0f172a]">أفضل مقرر</h2>
        <p className="mt-2 text-sm text-[#64748b]">لا توجد بيانات كافية لعرض تقرير مميز حالياً.</p>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-[#0f172a] p-6 shadow-sm sm:p-8"
      dir="rtl"
    >
      <div className="absolute -left-8 -top-8 size-32 rounded-full bg-[#f5a524]/10" />
      <div className="absolute -bottom-10 -right-6 size-40 rounded-full bg-[#f5a524]/5" />

      <div className="relative">
        <span className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#f5a524]/20">
          <AdminIcon
            src="/images/student/icon-trending.svg"
            className="size-6 text-[#f5a524]"
          />
        </span>

        <h2 className="text-xl font-black text-white">{course.title}</h2>
        <p className="mt-3 text-sm leading-7 text-[#94a3b8]">
          {course.enrolledCount} طالب مسجل — إجمالي الدخل {course.totalIncome} MET
        </p>

        <Link
          to="/admin/courses"
          className="mt-6 inline-flex rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-[#0f172a] transition-transform hover:scale-[1.02]"
        >
          عرض المقررات
        </Link>
      </div>
    </section>
  );
};
