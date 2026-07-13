import { StudentIcon } from "../../dashboard/components/StudentIcon";
import type { CourseAssignment } from "@/core/api/assignments";
import { AssignmentCard } from "./AssignmentCard";

interface AssignmentsGridProps {
  assignments: CourseAssignment[];
  onSubmit?: (assignmentId: string, textAnswer: string) => void | Promise<void>;
  submittingId?: string | null;
}

export const AssignmentsGrid = ({
  assignments,
  onSubmit,
  submittingId,
}: AssignmentsGridProps) => {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      dir="rtl"
    >
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onSubmit={onSubmit}
          isSubmitting={submittingId === assignment.id}
        />
      ))}
    </div>
  );
};

interface AssignmentsLoadMoreProps {
  label: string;
}

export const AssignmentsLoadMore = ({ label }: AssignmentsLoadMoreProps) => {
  return (
    <div className="flex justify-center pt-2" dir="rtl">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-6 py-3 text-sm font-semibold text-[#475569] shadow-sm transition-colors hover:bg-[#f8fafc]"
      >
        <span>{label}</span>
        <StudentIcon
          src="/images/student/icon-chevron-down.svg"
          className="size-4 text-[#94a3b8]"
        />
      </button>
    </div>
  );
};
