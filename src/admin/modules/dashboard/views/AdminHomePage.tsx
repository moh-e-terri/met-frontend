import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import {
  adminQueryKeys,
  fetchAdminCourses,
  fetchAdminStats,
  fetchAdminStatsRaw,
  mapAdminActivities,
  mapAdminCourseSummaries,
  mapFeaturedCourse,
  mapRevenueDistribution,
} from "@/admin/api";
import { AdminActivitiesSection } from "../components/AdminActivitiesSection";
import { AdminCoursesSummary } from "../components/AdminCoursesSummary";
import { AdminFeaturedReport } from "../components/AdminFeaturedReport";
import { AdminRevenueDistribution } from "../components/AdminRevenueDistribution";
import { AdminStatsCards } from "../components/AdminStatsCards";
import { AdminWelcomeSection } from "../components/AdminWelcomeSection";

export const AdminHomePage = () => {
  const statsQuery = useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: fetchAdminStats,
  });

  const statsRawQuery = useQuery({
    queryKey: [...adminQueryKeys.stats, "raw"],
    queryFn: fetchAdminStatsRaw,
  });

  const coursesQuery = useQuery({
    queryKey: adminQueryKeys.courses({ page: 1, limit: 5 }),
    queryFn: () => fetchAdminCourses({ page: 1, limit: 5 }),
  });

  const courseSummaries = mapAdminCourseSummaries(coursesQuery.data?.items ?? []);
  const statsRaw = statsRawQuery.data ?? {};
  const revenueItems = mapRevenueDistribution(statsRaw);
  const activities = mapAdminActivities(statsRaw);
  const featuredCourse = mapFeaturedCourse(statsRaw);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminWelcomeSection />

      {statsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {statsQuery.error instanceof Error
            ? statsQuery.error.message
            : "تعذر تحميل إحصائيات المنصة"}
        </div>
      ) : null}

      <AdminStatsCards
        stats={statsQuery.data ?? []}
        isLoading={statsQuery.isLoading}
      />

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <AdminRevenueDistribution
            items={revenueItems}
            isLoading={statsRawQuery.isLoading}
          />
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <AdminCoursesSummary
            courses={courseSummaries}
            isLoading={coursesQuery.isLoading}
          />
        </div>
      </section>

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <AdminFeaturedReport
            course={featuredCourse}
            isLoading={statsRawQuery.isLoading}
          />
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <AdminActivitiesSection
            activities={activities}
            isLoading={statsRawQuery.isLoading}
          />
        </div>
      </section>
    </PageMotion>
  );
};
