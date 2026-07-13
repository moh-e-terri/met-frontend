import { Link, useNavigate } from "react-router-dom";
import {
  getCourseLevelLabel,
  savePendingEnrollment,
  type AvailableCourse,
} from "@/student/api/availableCourses";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface CatalogCourseCardProps {
  course: AvailableCourse;
}

export const CatalogCourseCard = ({ course }: CatalogCourseCardProps) => {
  const navigate = useNavigate();

  const handleEnroll = () => {
    savePendingEnrollment(course);
    navigate(`/student/payments?courseId=${course.id}`, { state: { course } });
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-[#f8fafc]">
        <img
          src={course.image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/55 to-transparent" />

        <div className="absolute right-3 top-3 flex flex-wrap gap-2">
          {course.level ? (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#0f172a]">
              {getCourseLevelLabel(course.level)}
            </span>
          ) : null}
          {course.category ? (
            <span className="rounded-full bg-[#fff7ed]/95 px-2.5 py-1 text-[10px] font-bold text-[#f5a524]">
              {course.category}
            </span>
          ) : null}
        </div>

        <span
          className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#0f172a]/85 px-3 py-1 text-xs font-bold text-white"
          dir="ltr"
        >
          <StudentIcon src="/images/admin/icon-coin.svg" className="size-3.5 text-[#f5a524]" />
          {course.metCost} MET
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5" dir="rtl">
        <h3 className="min-h-14 text-right text-lg font-bold leading-snug text-[#0f172a]">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748b]">
          {course.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#64748b]">
          {course.instructor ? (
            <span className="inline-flex items-center gap-1.5">
              <StudentIcon
                src="/images/student/icon-active-user.svg"
                className="size-3.5 text-[#f5a524]"
              />
              {course.instructor}
            </span>
          ) : null}
          {course.lessonsCount ? (
            <span className="inline-flex items-center gap-1.5">
              <StudentIcon
                src="/images/student/icon-play.svg"
                className="size-3.5 text-[#94a3b8]"
              />
              {course.lessonsCount} درس
            </span>
          ) : null}
        </div>

        <div className="mt-auto pt-5">
          {!course.canAfford && !course.isEnrolled ? (
            <p className="mb-3 rounded-xl bg-[#fff7ed] px-3 py-2 text-center text-xs font-medium text-[#f59e0b]">
              رصيد MET غير كافٍ — أكمل الدفع لشحن الرصيد والاشتراك
            </p>
          ) : null}

          {course.isEnrolled ? (
            <Link
              to={`/student/my-courses/${course.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14b8a6] py-3 text-sm font-bold text-white transition-transform hover:scale-[1.01]"
            >
              <StudentIcon src="/images/student/icon-check.svg" className="size-4 text-white" />
              <span>متابعة الدورة</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleEnroll}
              className="w-full rounded-2xl bg-[#f5a524] py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.25)] transition-transform hover:scale-[1.01]"
            >
              اشتراك في المقرر
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
