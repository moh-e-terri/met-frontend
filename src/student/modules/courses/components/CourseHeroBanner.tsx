import { AnimatedBar } from "@/shared/motion";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface CourseHeroBannerProps {
  title: string;
  instructor?: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
}

export const CourseHeroBanner = ({
  title,
  instructor,
  progressPercent,
  completedLessons,
  totalLessons,
}: CourseHeroBannerProps) => {
  return (
    <section
      className="rounded-3xl bg-[#0f172a] p-6 text-white sm:p-8"
      dir="rtl"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1 text-right">
          <div className="mb-4 flex flex-wrap justify-start gap-2">
            <span className="rounded-full bg-[#f5a524] px-3 py-1 text-xs font-semibold text-white">
              دورة مسجلة
            </span>
          </div>

          <h1 className="text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
            {title}
          </h1>

          {instructor ? (
            <p className="mt-4 flex items-center justify-start gap-2 text-sm text-[#cbd5e1]">
              <StudentIcon
                src="/images/student/icon-active-user.svg"
                className="size-4 text-[#f5a524]"
              />
              <span>المحاضر: {instructor}</span>
            </p>
          ) : null}
        </div>

        <div className="w-full shrink-0 rounded-2xl bg-[#1e293b] p-5 lg:max-w-xs">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[#f5a524]" dir="ltr">
              {progressPercent}%
            </span>
            <span className="text-sm font-medium text-[#e2e8f0]">
              إنجازك في الدورة
            </span>
          </div>
          <AnimatedBar
            value={progressPercent}
            className="h-2 bg-[#334155]"
            barClassName="rounded-full bg-[#f5a524]"
          />
          <p className="mt-3 text-right text-xs text-[#94a3b8]">
            تم إكمال {completedLessons} من أصل {totalLessons} درساً
          </p>
        </div>
      </div>
    </section>
  );
};
