import { StartChatButton } from "@/shared/modules/chats";
import type { MyCourseData } from "../data/mockMyCourse";

interface MyCourseSidebarWidgetsProps {
  instructor: MyCourseData["instructor"];
  courseId: string;
}

export const MyCourseSidebarWidgets = ({
  instructor,
  courseId,
}: MyCourseSidebarWidgetsProps) => {
  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm text-center">
        <img
          src={instructor.avatar}
          alt=""
          className="mx-auto size-20 rounded-full object-cover"
          aria-hidden
        />
        <h3 className="mt-4 text-base font-bold text-[#0f172a]">
          {instructor.name}
        </h3>
        <p className="mt-1 text-xs text-[#f5a524]">{instructor.role}</p>
        <p className="mt-3 text-right text-sm leading-6 text-[#64748b]">
          {instructor.bio}
        </p>
        <div className="mt-4">
          {instructor.id ? (
            <StartChatButton
              userId={instructor.id}
              name={instructor.name}
              chatsPath="/student/chats"
              courseId={courseId}
              iconOnly={false}
              label="إرسال رسالة"
              className="w-full rounded-2xl border-transparent bg-[#0f172a] py-2.5 text-sm font-semibold text-white hover:bg-[#1e293b] hover:text-white"
            />
          ) : (
            <p className="rounded-2xl bg-[#f8fafc] px-3 py-2.5 text-xs text-[#94a3b8]">
              معرّف المحاضر غير متاح حالياً للتواصل المباشر.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
