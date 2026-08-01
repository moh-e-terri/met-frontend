import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import { Pagination } from "@/shared/components/Pagination";
import {
  availableCoursesQueryKeys,
  fetchAvailableCourses,
  type CourseLevel,
} from "@/student/api/availableCourses";
import { CatalogCourseGrid } from "../components/CatalogCourseGrid";
import { CatalogFiltersBar } from "../components/CatalogFiltersBar";
import { CatalogPageHeader } from "../components/CatalogPageHeader";

export const StudentCatalogPage = () => {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [level, setLevel] = useState<CourseLevel | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: debouncedSearch || undefined,
      level: level || undefined,
    }),
    [page, debouncedSearch, level],
  );

  const catalogQuery = useQuery({
    queryKey: availableCoursesQueryKeys.list(queryParams, session?.userId),
    queryFn: () => fetchAvailableCourses(queryParams),
    enabled: Boolean(session?.userId),
  });

  const courses = catalogQuery.data?.courses ?? [];
  const pagination = catalogQuery.data?.pagination;

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <CatalogPageHeader myMetPoints={catalogQuery.data?.myMetPoints} />

      {catalogQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {catalogQuery.error instanceof Error
            ? catalogQuery.error.message
            : "تعذر تحميل المقررات المتاحة"}
        </div>
      ) : null}

      <CatalogFiltersBar
        search={search}
        level={level}
        onSearchChange={setSearch}
        onLevelChange={(value) => {
          setLevel(value);
          setPage(1);
        }}
        total={pagination?.total}
      />

      <CatalogCourseGrid
        courses={courses}
        isLoading={catalogQuery.isLoading}
        isFiltered={Boolean(debouncedSearch || level)}
        myMetPoints={catalogQuery.data?.myMetPoints ?? 0}
      />

      <Pagination
        className="border-0 pt-0"
        pagination={pagination ?? {
          page: 1,
          totalPages: 1,
          total: courses.length,
          limit: 12,
          hasNextPage: false,
          hasPrevPage: false,
        }}
        onPageChange={setPage}
        disabled={catalogQuery.isFetching}
        summary={
          pagination ? (
            <>
              عرض {courses.length} من أصل {pagination.total} مقرر
            </>
          ) : undefined
        }
      />
    </PageMotion>
  );
};
