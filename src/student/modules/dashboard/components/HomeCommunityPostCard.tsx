import { StudentIcon } from "./StudentIcon";

interface HomeCommunityPostCardProps {
  author: string;
  avatar: string;
  time: string;
  content: string;
  likes: number;
  replies: number;
  tag?: string;
}

export const HomeCommunityPostCard = ({
  author,
  avatar,
  time,
  content,
  likes,
  replies,
  tag,
}: HomeCommunityPostCardProps) => {
  return (
    <article className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
      <header
        className="mb-2 flex items-start justify-between gap-2"
        dir="rtl"
      >
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={avatar}
            alt=""
            className="size-10 shrink-0 rounded-full"
            aria-hidden
          />
          <div className="min-w-0 text-right">
            <p className="text-sm font-bold text-[#0f172a]">{author}</p>
            {tag && (
              <span className="mt-0.5 inline-block rounded-full bg-[#fff7ed] px-2 py-0.5 text-[10px] font-semibold text-[#f5a524]">
                {tag}
              </span>
            )}
          </div>
        </div>

        <span className="shrink-0 text-xs text-[#94a3b8]">{time}</span>
      </header>

      <div dir="rtl" className="text-right">
        <p className="text-sm leading-6 text-[#475569]">{content}</p>

        <div className="mt-3 flex items-center justify-start gap-4 text-xs text-[#64748b]">
          <span className="inline-flex items-center gap-1.5">
            <StudentIcon
              src="/images/student/icon-reply.svg"
              className="size-3.5 text-[#94a3b8]"
            />
            <span>{replies}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StudentIcon
              src="/images/student/icon-heart.svg"
              className="size-3.5 text-[#94a3b8]"
            />
            <span>{likes}</span>
          </span>
        </div>
      </div>
    </article>
  );
};
