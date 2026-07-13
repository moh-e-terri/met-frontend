import { Link } from "react-router-dom";
import { AnimatedBar, Stagger } from "@/shared/motion";
import type { StudentContinueCourse } from "@/student/api";
import { StudentIcon } from "./StudentIcon";

interface ContinueLearningProps {
  courses: StudentContinueCourse[];
  isLoading?: boolean;
}

export const ContinueLearning = ({ courses, isLoading }: ContinueLearningProps) => {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a] sm:text-xl">
          <StudentIcon
            src="/images/student/icon-play.svg"
            className="size-5 text-[#f5a524]"
          />
          <span>متابعة التعلم</span>
        </h2>

        <Link to="/student/catalog" className="text-sm font-medium text-[#f5a524]">
          عرض جميع الدورات
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[320px] animate-pulse rounded-3xl border border-[#e2e8f0] bg-white"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e2e8f0] bg-white px-6 py-10 text-center">
          <p className="text-sm text-[#64748b]">
            لا توجد دورات مسجلة حالياً. تصفّح المقررات المتاحة وابدأ رحلتك.
          </p>
          <Link
            to="/student/catalog"
            className="mt-4 inline-block rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white"
          >
            استكشاف المقررات
          </Link>
        </div>
      ) : (
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerMs={90}>
          {courses.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative h-40 overflow-hidden bg-[#f8fafc]">
                <img
                  src={course.image}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  aria-hidden
                />
              </div>

              <div className="space-y-4 p-5">
                <h3 className="min-h-14 text-right text-lg font-bold leading-snug text-[#0f172a]">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between text-xs text-[#64748b]">
                  <span>{course.lessonsLabel}</span>
                  <span>{course.progress}%</span>
                </div>

                <AnimatedBar
                  value={course.progress}
                  className="h-2 bg-[#e2e8f0]"
                  barClassName={`rounded-full ${course.barColor}`}
                />

                <Link
                  to={`/student/my-courses/${course.id}`}
                  className="block w-full rounded-2xl bg-[#f5a524] py-2.5 text-center text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
                >
                  متابعة التعلم
                </Link>
              </div>
            </article>
          ))}
        </Stagger>
      )}
    </section>
  );
};
