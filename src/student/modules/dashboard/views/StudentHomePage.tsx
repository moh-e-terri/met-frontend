import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import {
  fetchCommunityPosts,
  fetchStudentDashboard,
  studentQueryKeys,
} from "@/student/api";
import { CommunitySection } from "../components/CommunitySection";
import { ContinueLearning } from "../components/ContinueLearning";
import { ProfileCard } from "../components/ProfileCard";
import { StatsCards } from "../components/StatsCards";

export const StudentHomePage = () => {
  const { session } = useAuth();

  const dashboardQuery = useQuery({
    queryKey: studentQueryKeys.dashboard(session?.userId),
    queryFn: fetchStudentDashboard,
    enabled: Boolean(session?.userId),
  });

  const communityQuery = useQuery({
    queryKey: studentQueryKeys.communityPosts(2, session?.userId),
    queryFn: () => fetchCommunityPosts(2, session?.userId),
    enabled: Boolean(session?.userId),
  });

  const dashboard = dashboardQuery.data;
  const isLoading = dashboardQuery.isLoading;

  return (
    <PageMotion className="mx-auto w-full max-w-[960px] space-y-6 sm:space-y-8">
      {dashboardQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {dashboardQuery.error instanceof Error
            ? dashboardQuery.error.message
            : "تعذر تحميل لوحة الطالب"}
        </div>
      ) : null}

      <ProfileCard profile={dashboard?.profile} isLoading={isLoading} />
      <StatsCards stats={dashboard?.stats} isLoading={isLoading} />
      <ContinueLearning courses={dashboard?.continueLearning ?? []} isLoading={isLoading} />
      <CommunitySection
        posts={communityQuery.data ?? []}
        isLoading={communityQuery.isLoading}
        isError={communityQuery.isError}
      />
    </PageMotion>
  );
};
