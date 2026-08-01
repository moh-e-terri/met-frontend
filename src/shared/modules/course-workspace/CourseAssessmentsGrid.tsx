import { Link } from "react-router-dom";
import type { CourseExam } from "@/core/api/exams";
import type { CourseAssignment } from "@/core/api/assignments";
import type { CourseWorkspaceCapabilities } from "./types";

interface CourseAssessmentsGridProps {
  exams: CourseExam[];
  assignments: CourseAssignment[];
  capabilities: CourseWorkspaceCapabilities;
  isLoading?: boolean;
}

export const CourseAssessmentsGrid = ({
  exams,
  assignments,
  capabilities,
  isLoading,
}: CourseAssessmentsGridProps) => {
  if (!capabilities.showAssessments) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2" dir="rtl">
      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0f172a]">الاختبارات</h2>
          <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#3b82f6]">
            {exams.length}
          </span>
        </div>

        {isLoading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-[#f8fafc]" />
        ) : exams.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#64748b]">لا توجد اختبارات بعد.</p>
        ) : (
          <ul className="space-y-3">
            {exams.slice(0, 5).map((exam) => (
              <li
                key={exam.id}
                className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-right">
                    <p className="font-bold text-[#0f172a]">{exam.title}</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      {exam.questions} سؤال · {exam.duration}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${exam.statusClassName}`}
                  >
                    {exam.statusLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {capabilities.canTakeAssessments && capabilities.quizzesPath ? (
          <Link
            to={capabilities.quizzesPath}
            className="mt-4 inline-flex text-sm font-bold text-[#3b82f6] hover:underline"
          >
            فتح صفحة الاختبارات
          </Link>
        ) : null}
        {capabilities.canManageContent && capabilities.managePath ? (
          <Link
            to={capabilities.managePath}
            className="mt-4 inline-flex text-sm font-bold text-[#f5a524] hover:underline"
          >
            إدارة الاختبارات
          </Link>
        ) : null}
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0f172a]">التكاليف</h2>
          <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-semibold text-[#f5a524]">
            {assignments.length}
          </span>
        </div>

        {isLoading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-[#f8fafc]" />
        ) : assignments.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#64748b]">لا توجد تكاليف بعد.</p>
        ) : (
          <ul className="space-y-3">
            {assignments.slice(0, 5).map((assignment) => (
              <li
                key={assignment.id}
                className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 text-right">
                    <p className="font-bold text-[#0f172a]">{assignment.title}</p>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      {assignment.points} نقطة
                      {assignment.deadline ? ` · ${assignment.deadline}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${assignment.statusClassName}`}
                  >
                    {assignment.statusLabel}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {capabilities.canTakeAssessments && capabilities.assignmentsPath ? (
          <Link
            to={capabilities.assignmentsPath}
            className="mt-4 inline-flex text-sm font-bold text-[#3b82f6] hover:underline"
          >
            فتح صفحة التكاليف
          </Link>
        ) : null}
        {capabilities.canManageContent && capabilities.managePath ? (
          <Link
            to={capabilities.managePath}
            className="mt-4 inline-flex text-sm font-bold text-[#f5a524] hover:underline"
          >
            إدارة التكاليف
          </Link>
        ) : null}
      </section>
    </div>
  );
};
