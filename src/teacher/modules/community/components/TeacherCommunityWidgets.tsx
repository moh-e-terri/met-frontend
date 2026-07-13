import { TeacherIcon } from "../../dashboard/components/TeacherIcon";
import type { CommunityInsights } from "@/shared/utils/communityInsights";

const WidgetTitle = ({ title, icon }: { title: string; icon: string }) => (
  <h2
    className="mb-4 flex w-full items-center justify-start gap-2 text-base font-bold text-[#0f172a]"
    dir="rtl"
  >
    <TeacherIcon src={icon} className="size-5 shrink-0 text-[#f5a524]" />
    <span>{title}</span>
  </h2>
);

interface TeacherCommunityWidgetsProps {
  insights: CommunityInsights;
  totalPosts: number;
  isLoading?: boolean;
}

export const TeacherCommunityWidgets = ({
  insights,
  totalPosts,
  isLoading,
}: TeacherCommunityWidgetsProps) => {
  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <WidgetTitle title="الأعضاء النشطون" icon="/images/student/icon-active-user.svg" />
        <div className="flex flex-wrap items-center justify-start gap-2">
          {insights.activeMembers.map((member) => (
            <img
              key={member.name}
              src={member.avatar}
              alt=""
              className="size-10 rounded-full border-2 border-white shadow-sm"
              aria-hidden
            />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <WidgetTitle title="الأقسام الشائعة" icon="/images/student/icon-groups.svg" />
        <ul className="space-y-3">
          {insights.groups.map((section) => (
            <li
              key={section.name}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-3 py-2.5"
            >
              <span className="truncate text-sm font-medium text-[#475569]">{section.name}</span>
              <span
                className="shrink-0 rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-xs font-semibold text-[#0f172a]"
                dir="ltr"
              >
                {section.count}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <WidgetTitle title="إحصائيات المجتمع" icon="/images/student/icon-bell.svg" />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#eff6ff] px-3 py-4 text-center">
            <p className="text-2xl font-black text-[#3b82f6]" dir="ltr">
              {totalPosts}
            </p>
            <p className="mt-1 text-[10px] font-medium text-[#64748b]">منشور</p>
          </div>
          <div className="rounded-2xl bg-[#ecfdf5] px-3 py-4 text-center">
            <p className="text-2xl font-black text-[#14b8a6]" dir="ltr">
              {insights.activeMembers.length}
            </p>
            <p className="mt-1 text-[10px] font-medium text-[#64748b]">عضو نشط</p>
          </div>
        </div>
      </section>
    </div>
  );
};
