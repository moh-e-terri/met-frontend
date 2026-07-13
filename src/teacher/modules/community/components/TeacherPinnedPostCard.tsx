import type { CommunityPostView } from "@/core/api/community";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface TeacherPinnedPostCardProps {
  post: CommunityPostView;
}

export const TeacherPinnedPostCard = ({ post }: TeacherPinnedPostCardProps) => {
  const postDate = new Date(post.time);
  const hasValidDate = !Number.isNaN(postDate.getTime());
  const day = hasValidDate ? String(postDate.getDate()) : "—";
  const month = hasValidDate
    ? postDate.toLocaleDateString("ar-SA", { month: "short" })
    : "—";

  return (
    <article
      className="rounded-3xl border border-[#fde8c8] bg-[#fff7ed]/30 p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-3 flex items-center justify-start gap-2">
        <TeacherIcon src="/images/teacher/icon-pin.svg" className="size-4 text-[#f5a524]" />
        <span className="text-xs font-bold text-[#f5a524]">منشور مثبت</span>
      </div>

      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <img src={post.avatar} alt="" className="size-11 shrink-0 rounded-full" aria-hidden />
          <div className="min-w-0 text-right">
            <p className="font-bold text-[#0f172a]">{post.author}</p>
            <p className="text-xs text-[#64748b]">
              {post.role} · {post.time}
            </p>
          </div>
        </div>
      </header>

      <p className="text-right text-sm leading-7 text-[#475569]">{post.content}</p>

      <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-[#fde8c8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#fff7ed] text-[#0f172a]"
            dir="ltr"
          >
            <span className="text-lg font-black">{day}</span>
            <span className="text-[10px] text-[#64748b]">{month}</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#0f172a]">منشور مثبت من المجتمع</p>
            <p className="text-xs text-[#64748b]">{post.time}</p>
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#fde8c8] pt-4"
        dir="ltr"
      >
        <div className="flex items-center gap-4 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5">
            <TeacherIcon src="/images/student/icon-reply.svg" className="size-3.5 text-[#94a3b8]" />
            <span>{post.comments} تعليق</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TeacherIcon src="/images/student/icon-heart.svg" className="size-3.5 text-[#94a3b8]" />
            <span>{post.likes} إعجاب</span>
          </span>
        </div>
      </div>
    </article>
  );
};
