import type { CommunityPostItem } from "@/student/api";
import { buildCommunityInsights } from "@/shared/utils/communityInsights";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface CommunitySidebarPanelProps {
  showTrending?: boolean;
  posts?: CommunityPostItem[];
}

export const CommunitySidebarPanel = ({
  showTrending = true,
  posts = [],
}: CommunitySidebarPanelProps) => {
  const insights = buildCommunityInsights(
    posts.map((post) => ({
      id: post.id,
      authorId: "",
      author: post.author,
      role: "عضو",
      avatar: post.avatar,
      time: post.time,
      content: post.content,
      likes: post.likes,
      likedByMe: false,
      comments: post.replies,
      attachments: [],
      tag: post.tag,
    })),
  );

  const studyProgress = Math.min(100, posts.length * 12 || 0);
  const tasksProgress = Math.min(100, insights.groups.length * 20 || 0);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <h3
          className="mb-5 flex w-full items-center justify-start gap-2 text-lg font-bold text-[#0f172a]"
          dir="rtl"
        >
          <StudentIcon
            src="/images/student/icon-trending.svg"
            className="size-5 text-[#f5a524]"
          />
          <span>نشاطك في المجتمع</span>
        </h3>

        <div className="space-y-5 text-sm" dir="rtl">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-[#475569]">
              <span>مشاركات المجتمع</span>
              <span className="font-semibold text-[#0f172a]" dir="ltr">
                {posts.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div
                className="h-full rounded-full bg-[#f5a524]"
                style={{ width: `${studyProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-[#475569]">
              <span>المواضيع النشطة</span>
              <span className="font-semibold text-[#0f172a]" dir="ltr">
                {insights.groups.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div
                className="h-full rounded-full bg-[#14b8a6]"
                style={{ width: `${tasksProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {showTrending ? (
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-right text-lg font-bold text-[#0f172a]" dir="rtl">
            المواضيع الرائجة
          </h3>
          {insights.groups.length === 0 ? (
            <p className="text-sm text-[#64748b]">لا توجد مواضيع رائجة بعد.</p>
          ) : (
            <ul className="space-y-3 text-sm" dir="rtl">
              {insights.groups.map((topic) => (
                <li
                  key={topic.name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fafc] px-3 py-2 text-[#475569]"
                >
                  <span>{topic.name}</span>
                  <span className="font-semibold text-[#0f172a]" dir="ltr">
                    {topic.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};
