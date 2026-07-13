import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import {
  adminQueryKeys,
  fetchAdminCourses,
  fetchAdminStatsRaw,
} from "@/admin/api";
import { asArray, asRecord, pickNumber } from "@/core/api/utils";
import { AdminCourseCatalogTable } from "../components/AdminCourseCatalogTable";
import { AdminCoursesPageHeader } from "../components/AdminCoursesPageHeader";
import { AdminCoursesStatsCards } from "../components/AdminCoursesStatsCards";
import { AdminCreateCourseForm } from "../components/AdminCreateCourseForm";

export const AdminCoursesPage = () => {
  const coursesQuery = useQuery({
    queryKey: adminQueryKeys.courses({ limit: 100 }),
    queryFn: () => fetchAdminCourses({ page: 1, limit: 100 }),
  });

  const statsQuery = useQuery({
    queryKey: [...adminQueryKeys.stats, "raw"],
    queryFn: fetchAdminStatsRaw,
  });

  const courses = coursesQuery.data?.items ?? [];
  const topCourses = asArray<Record<string, unknown>>(asRecord(statsQuery.data).topCourses);
  const totalEnrollments = topCourses.reduce(
    (sum, course) => sum + pickNumber(course.enrolledCount),
    0,
  );

  const avgInstructor =
    topCourses.length > 0
      ? Math.round(
          topCourses.reduce((sum, course) => sum + pickNumber(course.instructorPercentage), 0) /
            topCourses.length,
        )
      : 0;
  const avgReserved =
    topCourses.length > 0
      ? Math.round(
          topCourses.reduce((sum, course) => sum + pickNumber(course.reservedPercentage), 0) /
            topCourses.length,
        )
      : 0;

  const partition = [
    {
      label: "حصة المحاضر",
      percentage: avgInstructor,
      barClass: "bg-white",
    },
    {
      label: "حصة المنصة",
      percentage: Math.max(0, 100 - avgInstructor - avgReserved),
      barClass: "bg-white/80",
    },
    {
      label: "الاحتياطي",
      percentage: avgReserved,
      barClass: "bg-white/60",
    },
  ].filter((item) => item.percentage > 0);

  if (topCourses.length > 0 && partition.length === 0) {
    partition.push({
      label: "حصة المنصة",
      percentage: 100,
      barClass: "bg-white/80",
    });
  }

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminCoursesPageHeader />

      {coursesQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {coursesQuery.error instanceof Error
            ? coursesQuery.error.message
            : "تعذر تحميل قائمة الكورسات"}
        </div>
      ) : null}

      <AdminCoursesStatsCards
        activeCourses={coursesQuery.data?.pagination.total ?? courses.length}
        totalEnrollments={totalEnrollments}
        partition={partition}
      />
      <AdminCourseCatalogTable courses={courses} isLoading={coursesQuery.isLoading} />
      <AdminCreateCourseForm />
    </PageMotion>
  );
};
