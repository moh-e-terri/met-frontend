import { Link } from "react-router-dom";
import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { MyCourseAssignment } from "../data/mockMyCourse";

interface MyCourseAssignmentsCardProps {
  courseId: string;
  assignments: MyCourseAssignment[];
  pendingCount: number;
}

export const MyCourseAssignmentsCard = ({
  courseId,
  assignments,
  pendingCount,
}: MyCourseAssignmentsCardProps) => {
  return (
    <Link
      to={`/student/my-courses/${courseId}/assignments`}
      className="block rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      dir="rtl"
    >
      <div className="mb-4 flex items-center justify-between gap-2" dir="rtl">
        <h2 className="flex items-center justify-start gap-2 text-base font-bold text-[#0f172a]">
          <StudentIcon
            src="/images/student/icon-clipboard.svg"
            className="size-5 text-[#f5a524]"
          />
          <span>التكليفات</span>
        </h2>
        {pendingCount > 0 && (
          <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-xs font-semibold text-[#f5a524]">
            {pendingCount} معلق
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {assignments.length === 0 ? (
          <li className="rounded-2xl bg-[#f8fafc] px-3 py-6 text-center text-sm text-[#64748b]">
            لا توجد تكليفات حالياً.
          </li>
        ) : (
          assignments.map((assignment) => (
          <li
            key={assignment.id}
            className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-3"
          >
            <p className="text-sm font-bold text-[#0f172a]">{assignment.title}</p>
            <p className="mt-1 text-xs text-[#64748b]">{assignment.status}</p>
            {assignment.deadline && (
              <p className="mt-0.5 text-xs text-[#94a3b8]" dir="ltr">
                {assignment.deadline}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {assignment.primaryAction && (
                <span className="rounded-xl bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white">
                  {assignment.primaryAction}
                </span>
              )}
              {assignment.secondaryAction && (
                <span className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569]">
                  {assignment.secondaryAction}
                </span>
              )}
            </div>
          </li>
          ))
        )}
      </ul>
    </Link>
  );
};
