import type { CommunityPostView } from "@/core/api/community";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface TeacherCommunityPostCardProps {
  post: CommunityPostView;
}

export const TeacherCommunityPostCard = ({
  post,
}: TeacherCommunityPostCardProps) => {
  return (
    <article
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
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
          className="shrink-0 px-1 text-lg leading-none text-[#94a3b8]"
          aria-label="خيارات"
        >
          ···
        </button>
      </header>

      <p className="text-right text-sm leading-7 text-[#475569]">
        {post.content}
      </p>

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
        className="mt-4 flex items-center justify-between gap-3"
        dir="ltr"
      >
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e2e8f0] px-3 py-1.5 text-xs font-medium text-[#475569]"
        >
          <TeacherIcon
            src="/images/student/icon-share.svg"
            className="size-3.5 text-[#64748b]"
          />
          <span>مشاركة</span>
        </button>
        <div className="flex items-center gap-4 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5">
            <TeacherIcon
              src="/images/student/icon-reply.svg"
              className="size-3.5 text-[#94a3b8]"
            />
            <span>{post.comments} رد</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TeacherIcon
              src="/images/student/icon-heart.svg"
              className="size-3.5 text-[#94a3b8]"
            />
            <span>{post.likes}</span>
          </span>
        </div>
      </div>
    </article>
  );
};
