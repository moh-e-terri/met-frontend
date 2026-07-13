import { Link } from "react-router-dom";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import type { TeacherCourseItem } from "@/teacher/api";
import { TeacherIcon } from "./TeacherIcon";

interface TeacherCoursesSectionProps {
  courses?: TeacherCourseItem[];
  isLoading?: boolean;
}

export const TeacherCoursesSection = ({ courses = [], isLoading }: TeacherCoursesSectionProps) => {
  const basePath = getTeacherBasePath();

  if (isLoading) {
    return <div className="h-72 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center justify-start gap-2 text-lg font-bold text-[#0f172a]">
          <TeacherIcon src="/images/student/icon-book.svg" className="size-5 text-[#f5a524]" />
          <span>الدورات الحالية</span>
        </h2>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e2e8f0] bg-white px-6 py-12 text-center">
          <p className="text-sm text-[#64748b]">لا توجد دورات منشورة بعد.</p>
          <Link
            to={`${basePath}/courses/new`}
            className="mt-4 inline-block rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white"
          >
            إنشاء دورة جديدة
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm"
            >
              <div className="relative h-44 overflow-hidden bg-[#f8fafc]">
                <img
                  src={course.image}
                  alt=""
                  className="h-full w-full object-cover"
                  aria-hidden
                />
              </div>

              <div className="space-y-4 p-5">
                <h3 className="min-h-14 text-right text-lg font-bold leading-snug text-[#0f172a]">
                  {course.title}
                </h3>

                <div className="flex items-center justify-start gap-4 text-sm text-[#64748b]">
                  <span className="inline-flex items-center gap-1.5">
                    <TeacherIcon
                      src="/images/student/icon-active-user.svg"
                      className="size-4 text-[#94a3b8]"
                    />
                    <span dir="ltr">{course.students}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <TeacherIcon
                      src="/images/student/icon-book.svg"
                      className="size-4 text-[#94a3b8]"
                    />
                    <span>{course.lessons} درس</span>
                  </span>
                </div>

                <Link
                  to={`${basePath}/courses/${course.id}`}
                  className="block w-full rounded-2xl bg-[#f5a524] py-3 text-center text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
                >
                  إدارة الدورة
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
