import type {
  CourseAssignment,
  SubmitAssignmentPayload,
} from "@/core/api/assignments";
import { AssignmentCard } from "./AssignmentCard";

interface AssignmentsGridProps {
  assignments: CourseAssignment[];
  onSubmit?: (
    assignmentId: string,
    payload: SubmitAssignmentPayload,
    meta?: { fileName?: string },
  ) => void | Promise<void>;
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
