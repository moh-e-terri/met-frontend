import type { CommunityPostView } from "@/core/api/community";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface CommunityPostCardProps {
  post: CommunityPostView & { action?: "share" | "save" };
}

export const CommunityPostCard = ({ post }: CommunityPostCardProps) => {
  const actionLabel = post.action === "save" ? "حفظ" : "مشاركة";
  const actionIcon =
    post.action === "save"
      ? "/images/student/icon-save.svg"
      : "/images/student/icon-share.svg";

  return (
    <article className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <header
        className="mb-3 flex items-start justify-between gap-3"
        dir="rtl"
      >
        <div className="flex min-w-0 items-start gap-3">
          <img
            src={post.avatar}
            alt=""
            className="size-11 shrink-0 rounded-full"
            aria-hidden
          />
          <div className="min-w-0 text-right">
            <p className="font-bold text-[#0f172a]">{post.author}</p>
            <p className="text-xs text-[#64748b]">
              {post.role} · {post.time}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 px-1 text-lg leading-none text-[#94a3b8] transition-colors hover:text-[#64748b]"
          aria-label="خيارات"
        >
          ···
        </button>
      </header>

      <div className="text-right" dir="rtl">
        <p className="text-sm leading-7 text-[#475569]">{post.content}</p>

        {post.image && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2e8f0]">
            <img
              src={post.image}
              alt=""
              className="h-auto w-full object-cover"
              aria-hidden
            />
          </div>
        )}

        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
          dir="ltr"
        >
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:bg-[#f8fafc]"
          >
            <StudentIcon src={actionIcon} className="size-3.5 text-[#64748b]" />
            <span>{actionLabel}</span>
          </button>

          <div className="flex items-center gap-4 text-xs text-[#64748b]">
            <span className="inline-flex items-center gap-1.5">
              <StudentIcon
                src="/images/student/icon-reply.svg"
                className="size-3.5 text-[#94a3b8]"
              />
              <span>{post.comments} تعليق</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StudentIcon
                src="/images/student/icon-heart.svg"
                className="size-3.5 text-[#94a3b8]"
              />
              <span>{post.likes} إعجاب</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
