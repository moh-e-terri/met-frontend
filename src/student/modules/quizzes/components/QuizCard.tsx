import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import type { CourseExam } from "@/core/api/exams";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

interface QuizCardProps {
  quiz: CourseExam;
  onSubmit?: (exam: CourseExam, writtenAnswer: string) => void | Promise<unknown>;
  onViewResult?: (exam: CourseExam) => void | Promise<void>;
  isLoading?: boolean;
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

export const QuizCard = ({
  quiz,
  onSubmit,
  onViewResult,
  isLoading = false,
}: QuizCardProps) => {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [writtenAnswer, setWrittenAnswer] = useState("");

  const handleAction = async () => {
    if (quiz.status === "completed") {
      await onViewResult?.(quiz);
      return;
    }

    if (quiz.status === "available" || quiz.status === "in-progress") {
      setShowSubmitForm(true);
    }
  };

  const handleSubmitExam = async () => {
    await onSubmit?.(quiz, writtenAnswer.trim());
    setShowSubmitForm(false);
    setWrittenAnswer("");
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
            quiz.statusClassName,
          )}
        >
          {quiz.statusLabel}
        </span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
            quiz.categoryClassName,
          )}
        >
          {quiz.category}
        </span>
      </div>

      <h3 className="mb-3 text-right text-base font-bold text-[#0f172a]">
        {quiz.title}
      </h3>

      <div className="mb-4 flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
        <MetaItem
          icon="/images/student/icon-quiz.svg"
          label={`${quiz.questions} سؤال`}
        />
        <MetaItem icon="/images/student/icon-clock.svg" label={quiz.duration} />
        <MetaItem
          icon="/images/student/icon-level.svg"
          label={quiz.difficulty}
        />
      </div>

      <div className="mb-5 flex-1">
        {quiz.status === "completed" && quiz.score !== undefined && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3">
            <div className="text-right">
              <p className="text-xs text-[#64748b]">درجتك المحققة</p>
              <p className="text-2xl font-black text-[#0f172a]" dir="ltr">
                {quiz.score}%
              </p>
            </div>
            {quiz.letterGrade && (
              <span
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-full border-2 text-xl font-black",
                  quiz.letterGradeClassName,
                )}
                dir="ltr"
              >
                {quiz.letterGrade}
              </span>
            )}
          </div>
        )}

        {quiz.requiredGrade !== undefined && quiz.status !== "completed" && (
          <div className="flex items-center justify-start gap-2 rounded-2xl bg-[#f8fafc] px-4 py-3">
            <StudentIcon
              src="/images/student/icon-shield.svg"
              className="size-4 text-[#f5a524]"
            />
            <p className="text-xs text-[#64748b]">
              الدرجة المطلوبة للنجاح:{" "}
              <span className="font-bold text-[#0f172a]" dir="ltr">
                {quiz.requiredGrade}%
              </span>
            </p>
          </div>
        )}

        {showSubmitForm && quiz.status !== "completed" ? (
          <div className="mt-3 space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <p className="text-sm text-[#475569]">
              {quiz.questions > 0
                ? "أجب على الأسئلة أدناه ثم قدّم الاختبار."
                : "اكتب إجابتك أو اختر خياراً للتقديم."}
            </p>
            <textarea
              value={writtenAnswer}
              onChange={(event) => setWrittenAnswer(event.target.value)}
              rows={4}
              placeholder="إجابتك..."
              className="w-full resize-none rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm outline-none focus:border-[#f5a524]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-[#f5a524] py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {isLoading ? "جاري التقديم..." : "تقديم الاختبار"}
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
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
        disabled={isLoading || showSubmitForm}
        onClick={handleAction}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
          quiz.actionClassName,
        )}
      >
        {quiz.status !== "completed" && (
          <StudentIcon
            src="/images/student/icon-play.svg"
            className="size-4 text-current"
          />
        )}
        {quiz.status === "completed" && (
          <StudentIcon
            src="/images/student/icon-eye.svg"
            className="size-4 text-[#64748b]"
          />
        )}
        <span>{quiz.actionLabel}</span>
      </button>
    </article>
  );
};
