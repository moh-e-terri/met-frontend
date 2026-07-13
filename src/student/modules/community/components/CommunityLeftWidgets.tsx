import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { CommunityInsights } from "@/shared/utils/communityInsights";

const WidgetTitle = ({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) => (
  <h2
    className="mb-4 flex w-full items-center justify-start gap-2 text-base font-bold text-[#0f172a]"
    dir="rtl"
  >
    <StudentIcon src={icon} className="size-5 shrink-0 text-[#f5a524]" />
    <span>{title}</span>
  </h2>
);

interface CommunityLeftWidgetsProps {
  insights: CommunityInsights;
  isLoading?: boolean;
}

export const CommunityLeftWidgets = ({ insights, isLoading }: CommunityLeftWidgetsProps) => {
  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <WidgetTitle title="مواضيع نشطة" icon="/images/student/icon-groups.svg" />
        {insights.groups.length === 0 ? (
          <p className="text-sm text-[#64748b]">لا توجد مواضيع بعد.</p>
        ) : (
          <ul className="space-y-3">
            {insights.groups.map((group) => (
              <li
                key={group.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${group.iconBg}`}
                  >
                    <StudentIcon
                      src={group.icon}
                      className={`size-4 ${group.iconColor}`}
                    />
                  </span>
                  <span className="truncate text-sm font-medium text-[#475569]">
                    {group.name}
                  </span>
                </div>
                <span
                  className="shrink-0 rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-xs font-semibold text-[#0f172a]"
                  dir="ltr"
                >
                  {group.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <WidgetTitle title="مواضيع متصدرة" icon="/images/student/icon-trending.svg" />
        <div className="space-y-2">
          <span className="block w-full rounded-2xl bg-[#fff7ed] px-3 py-2.5 text-center text-sm font-semibold text-[#f5a524]">
            {insights.trendingTag}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {insights.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-2xl bg-[#f1f5f9] px-3 py-2 text-center text-xs font-medium text-[#475569]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <WidgetTitle title="أعضاء نشطون" icon="/images/student/icon-active-user.svg" />
        {insights.activeMembers.length === 0 ? (
          <p className="text-sm text-[#64748b]">لا يوجد نشاط كافٍ بعد.</p>
        ) : (
          <ul className="space-y-4">
            {insights.activeMembers.map((member) => (
              <li key={member.name} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatar}
                      alt=""
                      className="size-10 rounded-full"
                      aria-hidden
                    />
                    <span
                      className={`absolute bottom-0 left-0 size-2.5 rounded-full border-2 border-white ${
                        member.online ? "bg-[#22c55e]" : "bg-[#cbd5e1]"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <span className="truncate text-sm font-medium text-[#0f172a]">
                    {member.name}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
