import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteCommunityPost,
  toggleCommunityPostLike,
  toggleCommunityPostPin,
  type CommunityPostView,
} from "@/core/api/community";
import { cn } from "@/shared/utils/cn";
import { CommunityComments } from "./CommunityComments";

interface CommunityPostCardProps {
  post: CommunityPostView;
  currentUserId?: string;
  currentUserRole?: string;
  canModerate?: boolean;
  /** Scroll + highlight when opened from a notification */
  highlighted?: boolean;
  /** Open comments section automatically (e.g. post_reply notification) */
  autoOpenComments?: boolean;
}

function MaskIcon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block shrink-0 bg-current mask-contain mask-center mask-no-repeat",
        className,
      )}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
      }}
    />
  );
}

export const CommunityPostCard = ({
  post,
  currentUserId,
  currentUserRole,
  canModerate = false,
  highlighted = false,
  autoOpenComments = false,
}: CommunityPostCardProps) => {
  const queryClient = useQueryClient();
  const articleRef = useRef<HTMLElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(autoOpenComments);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [pinned, setPinned] = useState(Boolean(post.pinned));
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setLiked(post.likedByMe);
    setLikesCount(post.likes);
    setCommentsCount(post.comments);
    setPinned(Boolean(post.pinned));
  }, [post.id, post.likedByMe, post.likes, post.comments, post.pinned]);

  useEffect(() => {
    if (autoOpenComments) setCommentsOpen(true);
  }, [autoOpenComments, post.id]);

  useEffect(() => {
    if (!highlighted) return;
    const frame = window.requestAnimationFrame(() => {
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [highlighted, post.id]);

  const isAuthor = Boolean(currentUserId && post.authorId === currentUserId);
  const isAdmin = currentUserRole === "admin" || canModerate;
  const canDelete = isAuthor || isAdmin;
  const canPin = isAdmin;

  const invalidatePosts = async () => {
    await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
  };

  const likeMutation = useMutation({
    mutationFn: () => toggleCommunityPostLike(post.id),
    onMutate: () => setActionError(null),
    onSuccess: (result) => {
      setLiked(result.liked);
      setLikesCount(result.totalLikes);
    },
    onError: (error) => {
      setActionError(
        error instanceof Error ? error.message : "تعذر تحديث الإعجاب",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCommunityPost(post.id),
    onSuccess: invalidatePosts,
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "تعذر حذف المنشور");
    },
  });

  const pinMutation = useMutation({
    mutationFn: () => toggleCommunityPostPin(post.id),
    onSuccess: async (nextPinned) => {
      setPinned(nextPinned);
      await invalidatePosts();
    },
    onError: (error) => {
      setActionError(
        error instanceof Error ? error.message : "تعذر تثبيت المنشور",
      );
    },
  });

  return (
    <article
      ref={articleRef}
      id={`community-post-${post.id}`}
      className={cn(
        "rounded-3xl border bg-white p-5 shadow-sm transition-shadow",
        pinned ? "border-[#f5a524]/40 bg-[#fffbeb]" : "border-[#e2e8f0]",
        highlighted &&
          "ring-2 ring-[#f5a524]/60 shadow-[0_0_0_4px_rgba(245,165,36,0.15)]",
      )}
      dir="rtl"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <img
            src={post.avatar}
            alt=""
            className="size-11 shrink-0 rounded-full object-cover"
            aria-hidden
          />
          <div className="min-w-0 text-right">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-[#0f172a]">{post.author}</p>
              {pinned ? (
                <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#f5a524]">
                  مثبت
                </span>
              ) : null}
            </div>
            <p className="text-xs text-[#64748b]">
              {post.role} · {post.time}
            </p>
          </div>
        </div>

        {(canPin || canDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {canPin ? (
              <button
                type="button"
                onClick={() => pinMutation.mutate()}
                disabled={pinMutation.isPending}
                className="rounded-xl border border-[#e2e8f0] px-2.5 py-1 text-[11px] font-semibold text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-60"
              >
                {pinned ? "إلغاء التثبيت" : "تثبيت"}
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm("هل تريد حذف هذا المنشور؟")) return;
                  deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
                className="rounded-xl border border-[#fecaca] px-2.5 py-1 text-[11px] font-semibold text-[#ef4444] hover:bg-[#fef2f2] disabled:opacity-60"
              >
                حذف
              </button>
            ) : null}
          </div>
        )}
      </header>

      <p className="text-right text-sm leading-7 text-[#475569]">{post.content}</p>

      {post.image ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e8f0]">
          <img
            src={post.image}
            alt=""
            className="h-auto max-h-80 w-full object-cover"
            aria-hidden
          />
        </div>
      ) : null}

      {actionError ? (
        <p className="mt-3 text-right text-xs text-red-500">{actionError}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
              liked
                ? "border-[#fecaca] bg-[#fef2f2] text-[#ef4444]"
                : "border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]",
            )}
          >
            <MaskIcon
              src="/images/student/icon-heart.svg"
              className={cn("size-3.5", liked ? "text-[#ef4444]" : "text-[#94a3b8]")}
            />
            <span>{likesCount} إعجاب</span>
          </button>

          <button
            type="button"
            onClick={() => setCommentsOpen((open) => !open)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#f8fafc]"
          >
            <MaskIcon
              src="/images/student/icon-reply.svg"
              className="size-3.5 text-[#94a3b8]"
            />
            <span>{commentsCount} تعليق</span>
          </button>
        </div>
      </div>

      <CommunityComments
        postId={post.id}
        open={commentsOpen}
        currentUserId={currentUserId}
        canModerate={isAdmin}
        onCountChange={setCommentsCount}
      />
    </article>
  );
};
