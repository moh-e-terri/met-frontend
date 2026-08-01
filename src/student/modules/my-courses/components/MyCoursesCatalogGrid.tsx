import { Link } from "react-router-dom";
import { AnimatedBar, Stagger } from "@/shared/motion";
import type { StudentContinueCourse } from "@/student/api/types";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface MyCoursesCatalogGridProps {
  courses: StudentContinueCourse[];
  isLoading?: boolean;
}

export const MyCoursesCatalogGrid = ({ courses, isLoading }: MyCoursesCatalogGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[360px] animate-pulse rounded-3xl border border-[#e2e8f0] bg-white"
          />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <section
        className="rounded-3xl border border-dashed border-[#fde8c8] bg-gradient-to-b from-white to-[#fff7ed]/40 px-6 py-14 text-center shadow-sm"
        dir="rtl"
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#fff7ed]">
          <StudentIcon
            src="/images/student/icon-book.svg"
            className="size-8 text-[#f5a524]"
          />
        </div>
        <h2 className="text-lg font-bold text-[#0f172a]">لا توجد دورات مسجّلة بعد</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#64748b]">
          تصفّح المقررات المتاحة في أكاديمية MET وسجّل في أول دورة لك لتظهر هنا.
        </p>
        <Link
          to="/student/catalog"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#f5a524] px-6 py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-transform hover:scale-[1.02]"
        >
          <StudentIcon src="/images/student/icon-search.svg" className="size-4 text-white" />
          <span>استكشاف المقررات</span>
        </Link>
      </section>
    );
  }

  return (
    <Stagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" staggerMs={80}>
      {courses.map((course) => (
        <article
          key={course.id}
          className="group overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
        >
          <div className="relative h-44 overflow-hidden bg-[#f8fafc]">
            <img
              src={course.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/50 to-transparent" />
            <span
              className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0f172a]"
              dir="ltr"
            >
              {course.progress}%
            </span>
          </div>

          <div className="space-y-4 p-5" dir="rtl">
            <h3 className="min-h-14 text-right text-lg font-bold leading-snug text-[#0f172a]">
              {course.title}
            </h3>
            {course.university ? (
              <p className="text-sm font-semibold text-[#f5a524]">{course.university}</p>
            ) : null}

            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span className="inline-flex items-center gap-1.5">
                <StudentIcon
                  src="/images/student/icon-play.svg"
                  className="size-3.5 text-[#f5a524]"
                />
                <span>{course.lessonsLabel}</span>
              </span>
              <span>مدى التقدّم</span>
            </div>

            <AnimatedBar
              value={course.progress}
              className="h-2 bg-[#e2e8f0]"
              barClassName={`rounded-full ${course.barColor}`}
            />

            <div className="grid grid-cols-2 gap-2">
              <Link
                to={`/student/my-courses/${course.id}`}
                className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] py-2.5 text-center text-sm font-semibold text-[#475569] transition-colors hover:bg-[#f1f5f9]"
              >
                لوحة الدورة
              </Link>
              <Link
                to={`/student/courses/${course.id}`}
                className="rounded-2xl bg-[#f5a524] py-2.5 text-center text-sm font-bold text-white shadow-[0px_8px_16px_-4px_rgba(245,165,36,0.35)] transition-transform hover:scale-[1.01]"
              >
                متابعة التعلم
              </Link>
            </div>
          </div>
        </article>
      ))}
    </Stagger>
  );
};
