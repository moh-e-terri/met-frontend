import { Link } from "react-router-dom";
import { AnimatedBar } from "@/shared/motion";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { MyCourseOverview } from "../data/mockMyCourse";

interface MyCourseHeroCardProps {
  course: MyCourseOverview;
  onDrop?: () => void;
  isDropping?: boolean;
  dropError?: string | null;
}

export const MyCourseHeroCard = ({
  course,
  onDrop,
  isDropping = false,
  dropError,
}: MyCourseHeroCardProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <img
          src={course.image}
          alt=""
          className="h-36 w-full shrink-0 rounded-2xl object-cover sm:h-40 lg:w-48"
          aria-hidden
        />

        <div className="min-w-0 flex-1 text-right">
          <h1 className="text-xl font-black text-[#0f172a] sm:text-2xl">
            {course.title}
          </h1>
          <p className="mt-2 text-sm leading-7 text-[#64748b]">
            {course.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-start gap-4 text-sm text-[#64748b]">
            <span className="inline-flex items-center gap-1.5">
              <StudentIcon
                src="/images/student/icon-active-user.svg"
                className="size-4 text-[#f5a524]"
              />
              <span>المحاضر: {course.instructor}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StudentIcon
                src="/images/student/icon-community.svg"
                className="size-4 text-[#94a3b8]"
              />
              <span>{course.studentsCount}</span>
            </span>
          </div>
        </div>

        <div className="w-full shrink-0 lg:max-w-[220px]">
          <div className="mb-3 flex items-center justify-between gap-2 text-sm">
            <span className="font-bold text-[#f5a524]" dir="ltr">
              {course.progress}%
            </span>
            <span className="text-[#64748b]">مدى التقدم</span>
          </div>
          <AnimatedBar
            value={course.progress}
            className="mb-4 h-2 bg-[#e2e8f0]"
            barClassName="rounded-full bg-[#f5a524]"
          />
          <Link
            to={course.continueUrl}
            className="flex w-full items-center justify-center rounded-2xl bg-[#f5a524] py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
          >
            متابعة التعلم
          </Link>
          {onDrop ? (
            <button
              type="button"
              onClick={onDrop}
              disabled={isDropping}
              className="mt-2 w-full rounded-2xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-70"
            >
              {isDropping ? "جاري الانسحاب..." : "الانسحاب من المقرر"}
            </button>
          ) : null}
          {dropError ? (
            <p className="mt-2 text-center text-xs text-red-500">{dropError}</p>
          ) : null}
          {onDrop ? (
            <p className="mt-2 text-center text-[10px] leading-5 text-[#94a3b8]">
              استرداد كامل للنقاط خلال 48 ساعة من التسجيل
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
};
