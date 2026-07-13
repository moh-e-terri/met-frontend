import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  communityQueryKeys,
  createCommunityPost,
  fetchCommunityPosts,
  type CommunityPostView,
} from "@/core/api/community";
import { TeacherCommunityComposer } from "./TeacherCommunityComposer";
import { TeacherCommunityPostCard } from "./TeacherCommunityPostCard";
import { TeacherPinnedPostCard } from "./TeacherPinnedPostCard";

export const TeacherCommunityFeed = () => {
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: communityQueryKeys.posts(20),
    queryFn: () => fetchCommunityPosts({ limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) => createCommunityPost(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  const posts = postsQuery.data ?? [];
  const pinnedPost = posts.find((post) => post.pinned);
  const regularPosts = posts.filter((post) => !post.pinned);

  const handleSubmit = async (content: string) => {
    await createMutation.mutateAsync(content);
  };

  return (
    <div className="space-y-6">
      <TeacherCommunityComposer
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.isError && createMutation.error instanceof Error
            ? createMutation.error.message
            : undefined
        }
      />

      {postsQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-3xl bg-[#f8fafc]" />
          ))}
        </div>
      ) : postsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {postsQuery.error instanceof Error
            ? postsQuery.error.message
            : "تعذر تحميل منشورات المجتمع"}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-[#e2e8f0] bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#0f172a]">لا توجد منشورات بعد</p>
          <p className="mt-2 text-sm text-[#64748b]">شارك إعلاناً أو نصيحة مع مجتمع المدرّسين والطلاب.</p>
        </div>
      ) : (
        <>
          {pinnedPost ? <TeacherPinnedPostCard post={pinnedPost} /> : null}

          <div className="space-y-5">
            {regularPosts.map((post: CommunityPostView) => (
              <TeacherCommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
