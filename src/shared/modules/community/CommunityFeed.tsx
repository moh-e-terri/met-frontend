import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import {
  communityQueryKeys,
  createCommunityPost,
  fetchCommunityPosts,
  type CommunityPostView,
} from "@/core/api/community";
import { rememberPostCommunityScope } from "@/core/api/notifications";
import { CommunityComposer } from "./CommunityComposer";
import { CommunityPostCard } from "./CommunityPostCard";

interface CommunityFeedProps {
  canModerate?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  composerPlaceholder?: string;
  /** When set, only show/create posts for this course */
  courseId?: string;
  courseTitle?: string;
}

export const CommunityFeed = ({
  canModerate = false,
  emptyTitle = "لا توجد منشورات بعد",
  emptySubtitle = "كن أول من يشارك سؤالاً أو فكرة مع المجتمع.",
  composerPlaceholder,
  courseId,
  courseTitle,
}: CommunityFeedProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const userId = session?.userId;
  const focusPostId = searchParams.get("postId") || "";
  const openComments = searchParams.get("comments") === "1";
  const focusedRef = useRef(false);
  const scopeKey = courseId || "global";

  const postsQuery = useQuery({
    queryKey: communityQueryKeys.posts(50, 1, userId || "anon", scopeKey),
    queryFn: () =>
      fetchCommunityPosts({
        limit: 50,
        currentUserId: userId,
        courseId,
      }),
    enabled: Boolean(session),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { content: string; attachments?: string[] }) =>
      createCommunityPost({
        content: payload.content,
        attachments: payload.attachments,
        courseId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  const authorProfileBasePath =
    session?.role === "teacher"
      ? "/teacher/students"
      : session?.role === "admin"
        ? "/admin/students"
        : undefined;
  const posts = postsQuery.data ?? [];
  const pinnedPosts = posts.filter((post) => post.pinned);
  const regularPosts = posts.filter((post) => !post.pinned);
  const orderedPosts = [...pinnedPosts, ...regularPosts];

  useEffect(() => {
    for (const post of posts) {
      rememberPostCommunityScope(post.id, post.courseId || courseId || null);
    }
  }, [posts, courseId]);

  useEffect(() => {
    focusedRef.current = false;
  }, [focusPostId]);

  useEffect(() => {
    if (!focusPostId || postsQuery.isLoading || focusedRef.current) return;
    const exists = orderedPosts.some((post) => post.id === focusPostId);
    if (!exists) return;

    focusedRef.current = true;
    const timer = window.setTimeout(() => {
      setSearchParams(
        (current) => {
          if (!current.get("postId") && !current.get("comments")) return current;
          const next = new URLSearchParams(current);
          next.delete("postId");
          next.delete("comments");
          return next;
        },
        { replace: true },
      );
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [focusPostId, orderedPosts, postsQuery.isLoading, setSearchParams]);

  return (
    <div className="space-y-6">
      <CommunityComposer
        avatar={
          session?.role === "admin"
            ? "/images/admin/avatar-admin.svg"
            : session?.role === "teacher"
              ? "/images/teacher/avatar-teacher-default.svg"
              : "/images/student/avatar-student-default.svg"
        }
        placeholder={
          composerPlaceholder ||
          (courseTitle
            ? `اكتب منشوراً خاصاً بمقرر ${courseTitle}...`
            : undefined)
        }
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
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
            <div
              key={index}
              className="h-40 animate-pulse rounded-3xl bg-[#f8fafc]"
            />
          ))}
        </div>
      ) : postsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {postsQuery.error instanceof Error
            ? postsQuery.error.message
            : "تعذر تحميل منشورات المجتمع"}
        </div>
      ) : orderedPosts.length === 0 ? (
        <div className="rounded-3xl border border-[#e2e8f0] bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-lg font-bold text-[#0f172a]">{emptyTitle}</p>
          <p className="mt-2 text-sm text-[#64748b]">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orderedPosts.map((post: CommunityPostView) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUserId={userId}
              currentUserRole={session?.role}
              canModerate={canModerate || session?.role === "admin"}
              highlighted={focusPostId === post.id}
              autoOpenComments={focusPostId === post.id && openComments}
              authorProfileBasePath={authorProfileBasePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};
