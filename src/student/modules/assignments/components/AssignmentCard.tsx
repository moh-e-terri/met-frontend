import { useState } from "react";
import { AnimatedBar } from "@/shared/motion";
import { cn } from "@/shared/utils/cn";
import type { CourseAssignment } from "@/core/api/assignments";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface AssignmentCardProps {
  assignment: CourseAssignment;
  onSubmit?: (assignmentId: string, textAnswer: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const MetaItem = ({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-[#64748b]">
    <StudentIcon src={icon} className="size-3.5 text-[#94a3b8]" />
    <span>{label}</span>
  </span>
);

export const AssignmentCard = ({
  assignment,
  onSubmit,
  isSubmitting = false,
}: AssignmentCardProps) => {
  const [showForm, setShowForm] = useState(false);
  const [answer, setAnswer] = useState("");
  const canSubmit =
    onSubmit &&
    (assignment.status === "pending" ||
      assignment.status === "overdue" ||
      assignment.status === "draft");

  const handleSubmit = async () => {
    if (!onSubmit || !answer.trim()) return;
    await onSubmit(assignment.id, answer.trim());
    setAnswer("");
    setShowForm(false);
  };

  return (
    <article
      className="flex h-full flex-col rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm"
      dir="rtl"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            assignment.statusClassName,
          )}
        >
          {assignment.statusLabel}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            assignment.categoryClassName,
          )}
        >
          {assignment.category}
        </span>
      </div>

      <h3 className="mb-3 text-right text-base font-bold text-[#0f172a]">
        {assignment.title}
      </h3>

      <div className="mb-4 flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
        <MetaItem
          icon="/images/student/icon-briefcase.svg"
          label={`${assignment.points} نقطة`}
        />
        <MetaItem
          icon="/images/student/icon-deadline.svg"
          label={assignment.deadline}
        />
        <MetaItem
          icon="/images/student/icon-file.svg"
          label={assignment.type}
        />
      </div>

      <div className="mb-5 flex-1">
        {assignment.status === "graded" && assignment.score !== undefined && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3">
            <div className="text-right">
              <p className="text-xs text-[#64748b]">درجتك المحققة</p>
              <p className="text-2xl font-black text-[#0f172a]" dir="ltr">
                {assignment.score}%
              </p>
              {assignment.submittedAt && (
                <p className="mt-1 text-[10px] text-[#94a3b8]">
                  {assignment.submittedAt}
                </p>
              )}
            </div>
            {assignment.letterGrade && (
              <span
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-full border-2 text-xl font-black",
                  assignment.letterGradeClassName,
                )}
                dir="ltr"
              >
                {assignment.letterGrade}
              </span>
            )}
          </div>
        )}

        {assignment.status === "draft" && assignment.draftProgress !== undefined && (
          <div className="space-y-2">
            {assignment.draftInfo && (
              <p className="text-right text-xs text-[#64748b]">
                {assignment.draftInfo}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#14b8a6]" dir="ltr">
                {assignment.draftProgress}%
              </span>
              <span className="text-[#64748b]">التقدم الحالي</span>
            </div>
            <AnimatedBar
              value={assignment.draftProgress}
              className="h-2 bg-[#e2e8f0]"
              barClassName="rounded-full bg-[#14b8a6]"
            />
          </div>
        )}

        {assignment.status === "pending" && assignment.feedbackPreview && (
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-right">
            <p className="text-xs leading-6 text-[#64748b]">
              {assignment.feedbackPreview}
            </p>
          </div>
        )}

        {assignment.status === "overdue" && assignment.overdueNote && (
          <div className="rounded-2xl border border-dashed border-[#fecaca] bg-[#fef2f2]/50 px-4 py-3 text-right">
            <p className="text-xs font-medium text-[#ef4444]">
              {assignment.overdueNote}
            </p>
          </div>
        )}

        {assignment.status === "submitted" && assignment.submittedAt && (
          <div className="rounded-2xl border border-dashed border-[#a7f3d0] bg-[#ecfdf5]/50 px-4 py-3 text-right">
            <p className="text-xs font-medium text-[#14b8a6]">
              {assignment.submittedAt}
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              في انتظار التقييم من المحاضر
            </p>
          </div>
        )}

        {showForm && canSubmit ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={4}
              placeholder="اكتب إجابتك أو ألصق رابط الملف..."
              className="w-full resize-none rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#f5a524]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !answer.trim()}
                className="flex-1 rounded-xl bg-[#f5a524] py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {isSubmitting ? "جاري التسليم..." : "تأكيد التسليم"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm text-[#64748b]"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        disabled={isSubmitting || (canSubmit && showForm)}
        onClick={() => {
          if (canSubmit) {
            setShowForm(true);
            return;
          }
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
          assignment.actionClassName,
        )}
      >
        {assignment.actionIcon && (
          <StudentIcon
            src={assignment.actionIcon}
            className={cn(
              "size-4",
              assignment.status === "graded" ||
                assignment.actionClassName.includes("border")
                ? "text-[#64748b]"
                : "text-current",
            )}
          />
        )}
        <span>{assignment.actionLabel}</span>
      </button>
    </article>
  );
};
