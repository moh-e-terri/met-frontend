import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  communityQueryKeys,
  createCommunityPostComment,
  deleteCommunityPostComment,
  fetchCommunityPostComments,
  type CommunityCommentView,
} from "@/core/api/community";
import { cn } from "@/shared/utils/cn";

interface CommunityCommentsProps {
  postId: string;
  currentUserId?: string;
  canModerate?: boolean;
  open: boolean;
  onCountChange?: (count: number) => void;
}

export const CommunityComments = ({
  postId,
  currentUserId,
  canModerate = false,
  open,
  onCountChange,
}: CommunityCommentsProps) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  const commentsQuery = useQuery({
    queryKey: communityQueryKeys.comments(postId),
    queryFn: () => fetchCommunityPostComments(postId),
    enabled: open,
  });

  useEffect(() => {
    if (commentsQuery.data) onCountChange?.(commentsQuery.data.length);
  }, [commentsQuery.data, onCountChange]);

  const createMutation = useMutation({
    mutationFn: (text: string) => createCommunityPostComment(postId, text),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.comments(postId),
      });
      await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) =>
      deleteCommunityPostComment(postId, commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.comments(postId),
      });
      await queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });

  if (!open) return null;

  const comments = commentsQuery.data ?? [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || createMutation.isPending) return;
    await createMutation.mutateAsync(trimmed);
  };

  return (
    <div className="mt-4 space-y-3 border-t border-[#f1f5f9] pt-4" dir="rtl">
      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <textarea
          rows={2}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="اكتب تعليقاً..."
          className="min-w-0 flex-1 resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm outline-none focus:border-[#f5a524]/30 focus:bg-white"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !content.trim()}
          className="rounded-2xl bg-[#0f172a] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {createMutation.isPending ? "..." : "تعليق"}
        </button>
      </form>

      {createMutation.isError ? (
        <p className="text-xs text-red-500">
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : "تعذر إضافة التعليق"}
        </p>
      ) : null}

      {commentsQuery.isLoading ? (
        <div className="h-16 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : comments.length === 0 ? (
        <p className="text-xs text-[#94a3b8]">لا توجد تعليقات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment: CommunityCommentView) => {
            const canDelete =
              canModerate ||
              (currentUserId && comment.authorId === currentUserId);

            return (
              <li
                key={comment.id}
                className="rounded-2xl bg-[#f8fafc] px-3 py-3 text-right"
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={comment.avatar}
                      alt=""
                      className="size-7 shrink-0 rounded-full object-cover"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0f172a]">
                        {comment.author}
                      </p>
                      <p className="text-[11px] text-[#94a3b8]">
                        {comment.role} · {comment.time}
                      </p>
                    </div>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm("حذف هذا التعليق؟")) return;
                        deleteMutation.mutate(comment.id);
                      }}
                      className={cn(
                        "text-[11px] font-semibold text-[#ef4444]",
                        deleteMutation.isPending && "opacity-50",
                      )}
                    >
                      حذف
                    </button>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-[#475569]">{comment.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
