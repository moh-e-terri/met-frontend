import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignmentQueryKeys,
  fetchAssignmentSubmissions,
  gradeAssignmentSubmission,
  type AssignmentSubmissionRow,
} from "@/core/api/assignments";
import { AppModal } from "@/shared/components/AppModal";
import { cn } from "@/shared/utils/cn";

interface AssignmentSubmissionsPanelProps {
  courseId: string;
  assignmentId: string;
  assignmentTitle: string;
  maxScore: number;
}

function formatWhen(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ar-SA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AssignmentSubmissionsPanel = ({
  courseId,
  assignmentId,
  assignmentTitle,
  maxScore,
}: AssignmentSubmissionsPanelProps) => {
  const queryClient = useQueryClient();
  const [grading, setGrading] = useState<AssignmentSubmissionRow | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submissionsQuery = useQuery({
    queryKey: assignmentQueryKeys.submissions(courseId, assignmentId),
    queryFn: () => fetchAssignmentSubmissions(courseId, assignmentId),
  });

  const gradeMutation = useMutation({
    mutationFn: () => {
      if (!grading) throw new Error("لا يوجد تسليم محدد");
      const numeric = Number(score);
      if (!Number.isFinite(numeric) || numeric < 0) {
        throw new Error("أدخل درجة صحيحة");
      }
      if (numeric > maxScore) {
        throw new Error(`الدرجة يجب ألا تتجاوز ${maxScore}`);
      }
      return gradeAssignmentSubmission(courseId, assignmentId, grading.id, {
        score: numeric,
        feedback: feedback.trim() || undefined,
      });
    },
    onSuccess: async () => {
      setGrading(null);
      setScore("");
      setFeedback("");
      setError(null);
      await queryClient.invalidateQueries({
        queryKey: assignmentQueryKeys.submissions(courseId, assignmentId),
      });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر حفظ التقييم",
      );
    },
  });

  const rows = useMemo(() => {
    const data = submissionsQuery.data;
    if (!data) return [];
    return [
      ...data.early.map((row) => ({ ...row, bucket: "early" as const })),
      ...data.late.map((row) => ({ ...row, bucket: "late" as const })),
    ];
  }, [submissionsQuery.data]);

  const openGrade = (row: AssignmentSubmissionRow) => {
    setGrading(row);
    setScore(row.score != null ? String(row.score) : "");
    setFeedback(row.feedback || "");
    setError(null);
  };

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-[#e2e8f0] bg-white p-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#0f172a]">التسليمات — {assignmentTitle}</p>
          <p className="text-xs text-[#64748b]">
            الدرجة الكاملة: {maxScore} · غير المسلّمين:{" "}
            {submissionsQuery.data?.notSubmittedCount ?? "—"}
          </p>
        </div>
      </div>

      {submissionsQuery.isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-[#f8fafc]" />
      ) : submissionsQuery.isError ? (
        <p className="text-sm text-red-500">
          {submissionsQuery.error instanceof Error
            ? submissionsQuery.error.message
            : "تعذر تحميل التسليمات"}
        </p>
      ) : rows.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#94a3b8]">لا تسليمات بعد.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const graded = row.score != null;
            return (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f1f5f9] bg-[#f8fafc] px-3 py-3"
              >
                <div className="min-w-0 text-right">
                  <p className="text-sm font-semibold text-[#0f172a]">{row.studentName}</p>
                  <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                    {formatWhen(row.submittedAt)}
                    {row.isLate || row.bucket === "late" ? " · متأخر" : " · في الموعد"}
                    {row.submissionType ? ` · ${row.submissionType}` : ""}
                  </p>
                  {row.fileUrl ? (
                    <a
                      href={row.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-semibold text-[#3b82f6] hover:underline"
                    >
                      فتح الملف المرفوع
                    </a>
                  ) : null}
                  {row.textAnswer ? (
                    <p className="mt-1 line-clamp-2 text-xs text-[#64748b]">{row.textAnswer}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      graded
                        ? "bg-[#ecfdf5] text-[#0f766e]"
                        : "bg-[#fff7ed] text-[#b45309]",
                    )}
                  >
                    {graded ? `${row.score}/${maxScore}` : "بانتظار التقييم"}
                  </span>
                  <button
                    type="button"
                    onClick={() => openGrade(row)}
                    className="rounded-xl bg-[#0f172a] px-3 py-2 text-xs font-bold text-white"
                  >
                    {graded ? "تعديل التقييم" : "تقييم"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AppModal
        open={Boolean(grading)}
        onClose={() => {
          if (gradeMutation.isPending) return;
          setGrading(null);
        }}
        title={`تقييم — ${grading?.studentName || ""}`}
        description={assignmentTitle}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={gradeMutation.isPending}
              onClick={() => setGrading(null)}
              className="rounded-2xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="button"
              disabled={gradeMutation.isPending}
              onClick={() => gradeMutation.mutate()}
              className="rounded-2xl bg-[#f5a524] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {gradeMutation.isPending ? "جاري الحفظ..." : "حفظ التقييم"}
            </button>
          </div>
        }
      >
        <div className="space-y-4" dir="rtl">
          {grading?.fileUrl ? (
            <a
              href={grading.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-[#3b82f6]"
            >
              مراجعة ملف الطالب
            </a>
          ) : null}
          {grading?.textAnswer ? (
            <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm text-[#475569]">
              {grading.textAnswer}
            </div>
          ) : null}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              الدرجة (من {maxScore})
            </label>
            <input
              type="number"
              min={0}
              max={maxScore}
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              ملاحظات للطالب
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
      </AppModal>
    </div>
  );
};
