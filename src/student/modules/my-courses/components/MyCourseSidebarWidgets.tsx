import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { MyCourseData } from "../data/mockMyCourse";

interface MyCourseSidebarWidgetsProps {
  instructor: MyCourseData["instructor"];
  stats: MyCourseData["stats"];
  upcomingDates: MyCourseData["upcomingDates"];
}

export const MyCourseSidebarWidgets = ({
  instructor,
  stats,
  upcomingDates,
}: MyCourseSidebarWidgetsProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm text-center">
        <img
          src={instructor.avatar}
          alt=""
          className="mx-auto size-20 rounded-full"
          aria-hidden
        />
        <h3 className="mt-4 text-base font-bold text-[#0f172a]">
          {instructor.name}
        </h3>
        <p className="mt-1 text-xs text-[#f5a524]">{instructor.role}</p>
        <p className="mt-3 text-right text-sm leading-6 text-[#64748b]">
          {instructor.bio}
        </p>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] py-2.5 text-sm font-semibold text-white"
          >
            <StudentIcon
              src="/images/student/icon-message.svg"
              className="size-4 text-white"
            />
            <span>إرسال رسالة</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#fde8c8] bg-[#fff7ed] py-2.5 text-sm font-semibold text-[#f5a524]"
          >
            <StudentIcon
              src="/images/student/icon-calendar.svg"
              className="size-4 text-[#f5a524]"
            />
            <span>حجز استشارة</span>
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-right text-sm font-bold text-[#0f172a]">
          تفاصيل الكورس
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-[#f8fafc] px-2 py-3 text-center"
            >
              <p className="text-lg font-black text-[#0f172a]" dir="ltr">
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] text-[#64748b]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-right text-sm font-bold text-[#0f172a]">
          مواعيد هامة قادمة
        </h3>
        <ul className="space-y-3">
          {upcomingDates.map((date) => (
            <li key={date.id} className="flex items-center gap-3">
              <div
                className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#f8fafc] text-[#0f172a]"
                dir="ltr"
              >
                <span className="text-sm font-bold">{date.day}</span>
                <span className="text-[10px] text-[#64748b]">{date.month}</span>
              </div>
              <p className="flex-1 text-right text-sm text-[#475569]">
                {date.title}
              </p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 w-full text-center text-xs font-semibold text-[#3b82f6] hover:underline"
        >
          عرض التقويم الكامل
        </button>
      </section>
    </div>
  );
};
