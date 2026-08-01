import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";
import {
  communityQueryKeys,
  createCommunityPost,
  fetchCommunityPosts,
  type CommunityPostView,
} from "@/core/api/community";

interface CourseDiscussionsProps {
  courseId: string;
  courseTitle?: string;
}

export const CourseDiscussions = ({ courseId, courseTitle }: CourseDiscussionsProps) => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const postsQuery = useQuery({
    queryKey: communityQueryKeys.posts(50, 1, "anon", courseId),
    queryFn: () => fetchCommunityPosts({ limit: 50, courseId }),
  });

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      createCommunityPost({ content, courseId }),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  const posts = postsQuery.data ?? [];

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <h2 className="mb-5 text-right text-lg font-bold text-[#0f172a]">
        نقاشات المقرر ({posts.length})
        {courseTitle ? (
          <span className="mr-2 text-sm font-semibold text-[#64748b]">· {courseTitle}</span>
        ) : null}
      </h2>

      <div className="mb-6 flex items-start gap-3">
        <img
          src={STUDENT_DEFAULT_AVATAR}
          alt=""
          className="size-10 shrink-0 rounded-full"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <textarea
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="اكتب سؤالك أو تعليقك حول هذا المقرر..."
            className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
          />
          <div className="mt-3 flex justify-start">
            <button
              type="button"
              disabled={!draft.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(draft.trim())}
              className="rounded-2xl bg-[#f5a524] px-5 py-2 text-sm font-bold text-white shadow-[0px_8px_16px_-4px_rgba(245,165,36,0.35)] transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {createMutation.isPending ? "جاري النشر..." : "إضافة تعليق"}
            </button>
          </div>
        </div>
      </div>

      {postsQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">
          لا توجد نقاشات على هذا المقرر بعد.
        </p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post: CommunityPostView) => (
            <li
              key={post.id}
              className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3 text-right"
            >
              <div className="mb-2 flex items-center justify-end gap-2">
                <div>
                  <p className="text-sm font-bold text-[#0f172a]">{post.author}</p>
                  <p className="text-[11px] text-[#94a3b8]">{post.time}</p>
                </div>
                <img
                  src={post.avatar || STUDENT_DEFAULT_AVATAR}
                  alt=""
                  className="size-9 rounded-full object-cover"
                />
              </div>
              <p className="text-sm leading-6 text-[#475569]">{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
