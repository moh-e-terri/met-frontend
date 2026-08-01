import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { ChatThread } from "@/core/api/chat";

interface ChatContactProfileProps {
  thread: ChatThread;
}

export const ChatContactProfile = ({ thread }: ChatContactProfileProps) => {
  const { session } = useAuth();
  const profilePath =
    session?.role === "teacher" && thread.participantId
      ? `/teacher/students/${thread.participantId}`
      : session?.role === "admin" && thread.participantId
        ? `/admin/students/${thread.participantId}`
        : null;

  return (
    <aside
      className="hidden h-full min-h-0 flex-col overflow-y-auto overscroll-contain p-5 xl:flex"
      dir="rtl"
    >
      <div className="text-center">
        {profilePath ? (
          <Link to={profilePath} className="inline-block">
            <img
              src={thread.avatar}
              alt=""
              className="mx-auto size-24 rounded-full transition-opacity hover:opacity-90"
              aria-hidden
            />
          </Link>
        ) : (
          <img
            src={thread.avatar}
            alt=""
            className="mx-auto size-24 rounded-full"
            aria-hidden
          />
        )}
        {profilePath ? (
          <Link
            to={profilePath}
            className="mt-4 inline-block text-lg font-bold text-[#0f172a] transition-colors hover:text-[#f5a524]"
          >
            {thread.name}
          </Link>
        ) : (
          <h2 className="mt-4 text-lg font-bold text-[#0f172a]">{thread.name}</h2>
        )}
        {thread.role && (
          <p className="mt-1 text-sm text-[#64748b]">{thread.role}</p>
        )}
        {profilePath ? (
          <Link
            to={profilePath}
            className="mt-3 inline-flex text-xs font-semibold text-[#f5a524] hover:text-[#d97706]"
          >
            عرض الملف الأساسي
          </Link>
        ) : null}
      </div>

      {thread.university && thread.major && (
        <div className="mt-6">
          <h3 className="mb-3 text-right text-sm font-bold text-[#0f172a]">
            المعلومات الأكاديمية
          </h3>
          <ul className="space-y-3 text-sm text-[#475569]">
            <li className="flex items-center justify-end gap-2">
              <span>{thread.university}</span>
              <StudentIcon
                src="/images/student/icon-university.svg"
                className="size-4 text-[#f5a524]"
              />
            </li>
            <li className="flex items-center justify-end gap-2">
              <span>{thread.major}</span>
              <StudentIcon
                src="/images/student/icon-major.svg"
                className="size-4 text-[#f5a524]"
              />
            </li>
          </ul>
        </div>
      )}

      {thread.sharedCourses && thread.sharedCourses.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-right text-sm font-bold text-[#0f172a]">
            الكورسات المشتركة
          </h3>
          <ul className="space-y-2">
            {thread.sharedCourses.map((course) => (
              <li
                key={course.title}
                className="flex items-center justify-between gap-2 rounded-xl bg-[#f8fafc] px-3 py-2.5 text-sm"
              >
                <span
                  className={
                    course.status === "active"
                      ? "rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-semibold text-[#14b8a6]"
                      : "rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#64748b]"
                  }
                >
                  {course.status === "active" ? "نشط" : "مكتمل"}
                </span>
                <span className="font-medium text-[#0f172a]">{course.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="mb-3 text-right text-sm font-bold text-[#0f172a]">
          الوسائط المشتركة
        </h3>
        <div className="flex justify-end gap-2">
          {[
            "/images/student/icon-link-media.svg",
            "/images/student/icon-image.svg",
            "/images/student/icon-doc-media.svg",
          ].map((icon) => (
            <button
              key={icon}
              type="button"
              className="flex size-10 items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#64748b] transition-colors hover:bg-white"
            >
              <StudentIcon src={icon} className="size-4" />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-[#f5a524] transition-colors hover:text-[#d97706]"
        >
          عرض الكل
        </button>
      </div>

      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-[#fecaca] bg-[#fef2f2] py-2.5 text-sm font-semibold text-[#ef4444] transition-colors hover:bg-[#fee2e2]"
      >
        <StudentIcon
          src="/images/student/icon-block.svg"
          className="size-4 text-[#ef4444]"
        />
        <span>حظر المستخدم</span>
      </button>
    </aside>
  );
};
