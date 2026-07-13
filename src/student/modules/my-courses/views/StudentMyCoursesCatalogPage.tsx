import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import { fetchMyCoursesCatalog, myCoursesQueryKeys } from "@/student/api/myCourses";
import { MyCoursesCatalogGrid } from "../components/MyCoursesCatalogGrid";
import { MyCoursesPageHeader } from "../components/MyCoursesPageHeader";
import { MyCoursesStatsRow } from "../components/MyCoursesStatsRow";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

export const StudentMyCoursesCatalogPage = () => {
  const [search, setSearch] = useState("");
  const { session } = useAuth();

  const catalogQuery = useQuery({
    queryKey: myCoursesQueryKeys.catalog(session?.userId),
    queryFn: fetchMyCoursesCatalog,
    enabled: Boolean(session?.userId),
  });

  const filteredCourses = useMemo(() => {
    const courses = catalogQuery.data?.courses ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return courses;
    return courses.filter((course) => course.title.toLowerCase().includes(query));
  }, [catalogQuery.data?.courses, search]);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <MyCoursesPageHeader />

      {catalogQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {catalogQuery.error instanceof Error
            ? catalogQuery.error.message
            : "تعذر تحميل دوراتك"}
        </div>
      ) : null}

      <MyCoursesStatsRow
        stats={catalogQuery.data?.stats}
        isLoading={catalogQuery.isLoading}
      />

      <section
        className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        dir="rtl"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">مقرراتي النشطة</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {catalogQuery.isLoading
                ? "جاري تحميل الدورات..."
                : `${filteredCourses.length} دورة`}
            </p>
          </div>

          <label className="relative block w-full sm:max-w-xs">
            <StudentIcon
              src="/images/student/icon-search.svg"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث عن دورة..."
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] pr-10 pl-4 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/40 focus:bg-white"
            />
          </label>
        </div>

        <MyCoursesCatalogGrid
          courses={filteredCourses}
          isLoading={catalogQuery.isLoading}
        />
      </section>
    </PageMotion>
  );
};
