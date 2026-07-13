import type { CommunityPostItem } from "@/student/api";
import { CommunitySidebarPanel } from "../../community/components/CommunitySidebarPanel";
import { HomeCommunityPostCard } from "./HomeCommunityPostCard";
import { StudentIcon } from "./StudentIcon";

interface CommunitySectionProps {
  posts: CommunityPostItem[];
  isLoading?: boolean;
  isError?: boolean;
}

export const CommunitySection = ({
  posts,
  isLoading,
  isError,
}: CommunitySectionProps) => {
  return (
    <section
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"
      dir="ltr"
    >
      <aside className="order-2 lg:order-1 lg:row-start-1">
        <CommunitySidebarPanel showTrending={false} posts={posts} />
      </aside>

      <div
        className="order-1 min-w-0 rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm lg:order-2 lg:row-start-1"
        dir="rtl"
      >
        <h2
          className="mb-6 flex w-full items-center justify-start gap-2 text-xl font-bold text-[#0f172a]"
          dir="rtl"
        >
          <StudentIcon
            src="/images/student/icon-chat-bubble.svg"
            className="size-5 text-[#f5a524]"
          />
          <span>آخر التفاعلات في المجتمع</span>
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-[#f8fafc]"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-[#64748b]">تعذر تحميل منشورات المجتمع.</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-[#64748b]">لا توجد منشورات حديثة بعد.</p>
        ) : (
          <div className="space-y-4">
            {posts.slice(0, 2).map((post) => (
              <HomeCommunityPostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
