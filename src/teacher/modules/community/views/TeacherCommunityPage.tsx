import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { communityQueryKeys, fetchCommunityPosts } from "@/core/api/community";
import { buildCommunityInsights } from "@/shared/utils/communityInsights";
import { TeacherCommunityFeed } from "../components/TeacherCommunityFeed";
import { TeacherCommunityWidgets } from "../components/TeacherCommunityWidgets";

export const TeacherCommunityPage = () => {
  const postsQuery = useQuery({
    queryKey: communityQueryKeys.posts(50),
    queryFn: () => fetchCommunityPosts({ limit: 50 }),
  });

  const insights = buildCommunityInsights(postsQuery.data ?? []);

  return (
    <PageMotion className="mx-auto w-full max-w-[1120px]">
      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <TeacherCommunityWidgets
            insights={insights}
            totalPosts={postsQuery.data?.length ?? 0}
            isLoading={postsQuery.isLoading}
          />
        </aside>
        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1" dir="rtl">
          <TeacherCommunityFeed />
        </div>
      </div>
    </PageMotion>
  );
};
