import { AnimatedBar } from "@/shared/motion";
import type { CourseStudent } from "@/teacher/api";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface CourseStudentsSectionProps {
  students: CourseStudent[];
  isLoading?: boolean;
}

export const CourseStudentsSection = ({
  students,
  isLoading,
}: CourseStudentsSectionProps) => {
  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center justify-start gap-2 text-lg font-bold text-[#0f172a]">
          <TeacherIcon
            src="/images/student/icon-groups.svg"
            className="size-5 text-[#f5a524]"
          />
          <span>طلاب الدورة</span>
        </h2>
        <span className="text-sm text-[#64748b]">{students.length} طالب</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-[#e2e8f0]" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#64748b]">
          لا يوجد طلاب مسجّلون في هذه الدورة بعد.
        </p>
      ) : (
        <ul className="space-y-3">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <img
                  src={student.avatar}
                  alt=""
                  className="size-11 shrink-0 rounded-full"
                  aria-hidden
                />
                <div className="min-w-0 text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <p className="font-bold text-[#0f172a]">{student.name}</p>
                    {student.isRecognized ? (
                      <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-semibold text-[#14b8a6]">
                        معروف مسبقاً
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-[#64748b]">
                    {student.university ?? student.email ?? "طالب"}
                  </p>
                </div>
              </div>

              <div className="w-full sm:max-w-[220px]">
                <div className="mb-1 flex items-center justify-between text-xs text-[#64748b]">
                  <span dir="ltr">{student.progress}%</span>
                  <span>التقدّم</span>
                </div>
                <AnimatedBar
                  value={student.progress}
                  className="h-2 bg-[#e2e8f0]"
                  barClassName="rounded-full bg-[#f5a524]"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
