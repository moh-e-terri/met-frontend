import { Link } from "react-router-dom";
import type { CourseEnrollee } from "@/core/api/courseEnrollees";
import { StartChatButton } from "@/shared/modules/chats";

interface CourseStudentsPanelProps {
  students: CourseEnrollee[];
  isLoading?: boolean;
  error?: string | null;
  chatsPath?: string;
  courseId?: string;
  /** Base path for student profile pages, e.g. `/admin/students` or `/teacher/students` */
  studentProfileBasePath?: string;
  /**
   * Which id to use in the profile URL.
   * Admin pages use student profile id when available; teacher uses auth user id.
   */
  profileIdMode?: "user" | "profile";
}

export const CourseStudentsPanel = ({
  students,
  isLoading,
  error,
  chatsPath = "/admin/chats",
  courseId,
  studentProfileBasePath,
  profileIdMode = "user",
}: CourseStudentsPanelProps) => {
  return (
    <section
      className="flex h-full flex-col rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#0f172a]">الطلاب المنتسبون</h2>
        <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#14b8a6]">
          {students.length} طالب
        </span>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : error ? (
        <p className="rounded-2xl bg-red-50 px-3 py-3 text-sm text-red-600">{error}</p>
      ) : students.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا يوجد طلاب مسجّلون بعد.</p>
      ) : (
        <ul className="max-h-[320px] space-y-2 overflow-y-auto">
          {students.map((student) => {
            const routeId =
              profileIdMode === "profile"
                ? student.profileId || student.id
                : student.id;
            const profilePath = studentProfileBasePath
              ? `${studentProfileBasePath}/${routeId}`
              : null;

            return (
              <li
                key={student.id}
                className="flex items-center gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-3 py-3"
              >
                {profilePath ? (
                  <Link to={profilePath} className="shrink-0">
                    <img
                      src={student.avatar}
                      alt=""
                      className="size-10 rounded-full object-cover transition-opacity hover:opacity-90"
                      aria-hidden
                    />
                  </Link>
                ) : (
                  <img
                    src={student.avatar}
                    alt=""
                    className="size-10 shrink-0 rounded-full object-cover"
                    aria-hidden
                  />
                )}
                <div className="min-w-0 flex-1 text-right">
                  {profilePath ? (
                    <Link
                      to={profilePath}
                      className="block truncate text-sm font-bold text-[#0f172a] transition-colors hover:text-[#f5a524]"
                    >
                      {student.name}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-bold text-[#0f172a]">
                      {student.name}
                    </p>
                  )}
                  <p className="truncate text-xs text-[#94a3b8]" dir="ltr">
                    {student.email || student.university || "—"}
                  </p>
                </div>
                {student.progress > 0 ? (
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#3b82f6]">
                    {student.progress}%
                  </span>
                ) : null}
                <StartChatButton
                  userId={student.id}
                  name={student.name}
                  chatsPath={chatsPath}
                  courseId={courseId}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
