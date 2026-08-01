import { Stagger } from "@/shared/motion";
import type { AvailableCourse } from "@/student/api/availableCourses";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import { CatalogCourseCard } from "./CatalogCourseCard";

interface CatalogCourseGridProps {
  courses: AvailableCourse[];
  isLoading?: boolean;
  isFiltered?: boolean;
  myMetPoints?: number;
}

export const CatalogCourseGrid = ({
  courses,
  isLoading,
  isFiltered,
  myMetPoints = 0,
}: CatalogCourseGridProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[420px] animate-pulse rounded-3xl border border-[#e2e8f0] bg-white"
          />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <section
        className="rounded-3xl border border-dashed border-[#e2e8f0] bg-white px-6 py-16 text-center"
        dir="rtl"
      >
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#f8fafc]">
          <StudentIcon
            src="/images/student/icon-book.svg"
            className="size-8 text-[#94a3b8]"
          />
        </div>
        <h2 className="text-lg font-bold text-[#0f172a]">لا توجد مقررات متاحة حالياً</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#64748b]">
          {isFiltered
            ? "لم نعثر على مقررات مطابقة لبحثك. جرّب تغيير الفلاتر أو مسح البحث."
            : "المقررات المعروضة هنا مخصّصة لجامعتك ويجب أن تكون منشورة من الإدارة. إذا كنت قد سجّلت للتو، جرّب تسجيل الخروج ثم الدخول مرة أخرى."}
        </p>
      </section>
    );
  }

  return (
    <Stagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" staggerMs={70}>
      {courses.map((course) => (
        <CatalogCourseCard key={course.id} course={course} myMetPoints={myMetPoints} />
      ))}
    </Stagger>
  );
};
