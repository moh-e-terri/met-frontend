import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { fetchInstructorDashboard, teacherQueryKeys } from "@/teacher/api";
import { TeacherActivitySection } from "../components/TeacherActivitySection";
import { TeacherAdminNotifications } from "../components/TeacherAdminNotifications";
import { TeacherCoursesSection } from "../components/TeacherCoursesSection";
import { TeacherEarningsCard } from "../components/TeacherEarningsCard";
import { TeacherProfileCard } from "../components/TeacherProfileCard";
import { TeacherStatsCards } from "../components/TeacherStatsCards";

export const TeacherHomePage = () => {
  const dashboardQuery = useQuery({
    queryKey: teacherQueryKeys.dashboard,
    queryFn: fetchInstructorDashboard,
  });

  const dashboard = dashboardQuery.data;

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      {dashboardQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "تعذر تحميل لوحة المدرس"}
        </div>
      ) : null}

      <TeacherProfileCard profile={dashboard?.profile} isLoading={dashboardQuery.isLoading} />
      <TeacherStatsCards stats={dashboard?.stats} isLoading={dashboardQuery.isLoading} />
      <TeacherCoursesSection courses={dashboard?.courses} isLoading={dashboardQuery.isLoading} />

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 space-y-6 xl:order-1 xl:row-start-1">
          <TeacherEarningsCard
            earnings={dashboard?.earnings}
            isLoading={dashboardQuery.isLoading}
          />
          <TeacherAdminNotifications
            notifications={dashboard?.notifications}
            isLoading={dashboardQuery.isLoading}
          />
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <TeacherActivitySection
            activities={dashboard?.activities}
            isLoading={dashboardQuery.isLoading}
          />
        </div>
      </section>
    </PageMotion>
  );
};
