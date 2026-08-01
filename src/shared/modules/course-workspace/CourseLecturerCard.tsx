import { StartChatButton } from "@/shared/modules/chats";

interface CourseLecturerCardProps {
  name?: string;
  avatar?: string;
  university?: string;
  lecturerId?: string;
  chatsPath?: string;
  courseId?: string;
}

export const CourseLecturerCard = ({
  name,
  avatar,
  university,
  lecturerId,
  chatsPath,
  courseId,
}: CourseLecturerCardProps) => {
  return (
    <section
      className="flex h-full flex-col justify-between rounded-3xl border border-[#e2e8f0] bg-gradient-to-br from-[#fff7ed] via-white to-[#f8fafc] p-5 shadow-sm"
      dir="rtl"
    >
      <div>
        <p className="text-xs font-semibold text-[#f5a524]">المحاضر</p>
        <div className="mt-4 flex items-center gap-3">
          <img
            src={avatar || "/images/teacher/avatar-teacher-default.svg"}
            alt=""
            className="size-14 rounded-full border-4 border-white object-cover shadow-sm"
            aria-hidden
          />
          <div className="min-w-0 flex-1 text-right">
            <h2 className="truncate text-lg font-bold text-[#0f172a]">
              {name || "غير معيّن"}
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {university || "مدرّس المقرر"}
            </p>
          </div>
          {lecturerId && chatsPath ? (
            <StartChatButton
              userId={lecturerId}
              name={name}
              chatsPath={chatsPath}
              courseId={courseId}
            />
          ) : null}
        </div>
      </div>
      <p className="mt-6 text-xs leading-6 text-[#94a3b8]">
        يتم عرض بيانات المحاضر كما وردت من الخادم المرتبط بهذا المقرر.
      </p>
    </section>
  );
};
