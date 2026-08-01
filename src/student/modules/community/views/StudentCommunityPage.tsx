import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { useAuth } from "@/core/auth/AuthContext";
import { communityQueryKeys, fetchCommunityPosts } from "@/core/api/community";
import { CommunityFeed } from "@/shared/modules/community";
import { buildCommunityInsights } from "@/shared/utils/communityInsights";
import { CommunityLeftWidgets } from "../components/CommunityLeftWidgets";

export const StudentCommunityPage = () => {
  const { session } = useAuth();

  const postsQuery = useQuery({
    queryKey: communityQueryKeys.posts(50, 1, session?.userId || "anon"),
    queryFn: () =>
      fetchCommunityPosts({ limit: 50, currentUserId: session?.userId }),
    enabled: Boolean(session),
  });

  const insights = buildCommunityInsights(postsQuery.data ?? []);

  return (
    <PageMotion className="mx-auto w-full max-w-[1120px]">
      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <CommunityLeftWidgets
            insights={insights}
            isLoading={postsQuery.isLoading}
          />
        </aside>
        <div dir="rtl" className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <CommunityFeed
            composerPlaceholder="اكتب سؤالاً أو شارك فكرة مع المجتمع..."
          />
        </div>
      </div>
    </PageMotion>
  );
};
