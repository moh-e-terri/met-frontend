import { STUDENT_DEFAULT_AVATAR } from "@/student/constants/assets";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { MyCoursePost } from "../data/mockMyCourse";

const composerActions = [
  { icon: "/images/student/icon-image.svg", color: "text-[#f5a524]" },
  { icon: "/images/student/icon-file.svg", color: "text-[#3b82f6]" },
  { icon: "/images/student/icon-question.svg", color: "text-[#22c55e]" },
];

interface MyCourseFeedProps {
  posts: MyCoursePost[];
}

export const MyCourseFeed = ({ posts }: MyCourseFeedProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <img
            src={STUDENT_DEFAULT_AVATAR}
            alt=""
            className="size-11 shrink-0 rounded-full"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <textarea
              rows={3}
              placeholder="اكتب سؤالاً أو ملاحظة حول هذا الكورس..."
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-right text-sm text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[#f5a524]/30 focus:bg-white"
            />
            <div className="mt-4 flex items-center justify-between" dir="ltr">
              <button
                type="button"
                className="rounded-2xl bg-[#f5a524] px-6 py-2.5 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)]"
              >
                نشر
              </button>
              <div className="flex items-center gap-2" dir="rtl">
                {composerActions.map((action) => (
                  <button
                    key={action.icon}
                    type="button"
                    className="flex size-9 items-center justify-center rounded-xl border border-[#e2e8f0] bg-white"
                  >
                    <StudentIcon
                      src={action.icon}
                      className={`size-4 ${action.color}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
        >
          <header
            className="mb-3 flex items-start justify-between gap-3"
            dir="rtl"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={post.avatar}
                alt=""
                className="size-11 shrink-0 rounded-full"
                aria-hidden
              />
              <div className="min-w-0 text-right">
                <p className="font-bold text-[#0f172a]">{post.author}</p>
                <p className="text-xs text-[#64748b]">{post.role}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2" dir="ltr">
              <button
                type="button"
                className="px-1 text-lg leading-none text-[#94a3b8]"
                aria-label="خيارات"
              >
                ···
              </button>
              <span className="text-xs text-[#94a3b8]">{post.time}</span>
            </div>
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
              <StudentIcon
                src="/images/student/icon-share.svg"
                className="size-3.5 text-[#64748b]"
              />
              <span>مشاركة</span>
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
        </article>
      ))}
    </div>
  );
};
