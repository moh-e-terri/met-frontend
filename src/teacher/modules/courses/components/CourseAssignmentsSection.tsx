import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignmentQueryKeys,
  createCourseAssignment,
  fetchCourseAssignments,
  type CourseAssignment,
} from "@/core/api/assignments";
import { AppModal } from "@/shared/components/AppModal";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";
import { AssignmentSubmissionsPanel } from "./AssignmentSubmissionsPanel";

interface CourseAssignmentsSectionProps {
  courseId: string;
}

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none transition-colors focus:border-[#f5a524] focus:bg-white";

function combineDeadline(date: string, time: string): string | undefined {
  if (!date) return undefined;
  const normalizedTime = time || "23:59";
  return new Date(`${date}T${normalizedTime}`).toISOString();
}

export const CourseAssignmentsSection = ({ courseId }: CourseAssignmentsSectionProps) => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissionType, setSubmissionType] = useState<"any" | "pdf" | "image" | "text">("any");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("23:59");
  const [maxScore, setMaxScore] = useState("100");
  const [error, setError] = useState<string | null>(null);

  const assignmentsQuery = useQuery({
    queryKey: assignmentQueryKeys.list(courseId),
    queryFn: () => fetchCourseAssignments(courseId),
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("23:59");
    setMaxScore("100");
    setSubmissionType("any");
    setError(null);
  };

  const close = () => {
    setOpen(false);
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createCourseAssignment(courseId, {
        title: title.trim(),
        description: description.trim() || undefined,
        submissionType,
        dueDate: combineDeadline(dueDate, dueTime),
        maxScore: maxScore ? Number(maxScore) : undefined,
      }),
    onSuccess: async () => {
      close();
      await queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.list(courseId) });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر إضافة الواجب",
      );
    },
  });

  const assignments = assignmentsQuery.data ?? [];

  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6" dir="rtl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#0f172a]">الواجبات</h2>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#3b82f6]"
        >
          <TeacherIcon src="/images/student/icon-add.svg" className="size-4 text-[#3b82f6]" />
          <span>إضافة واجب</span>
        </button>
      </div>

      {assignmentsQuery.isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : assignments.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد واجبات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((assignment: CourseAssignment) => {
            const expanded = expandedId === assignment.id;
            return (
              <li key={assignment.id}>
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3">
                  <div className="min-w-0 text-right">
                    <p className="text-sm font-bold text-[#0f172a]">{assignment.title}</p>
                    <p className="mt-0.5 text-xs text-[#64748b]">
                      {assignment.deadline} · {assignment.points} نقطة · {assignment.type}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-[#64748b]">
                      {assignment.type}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : assignment.id)
                      }
                      className="rounded-xl bg-[#0f172a] px-3 py-2 text-xs font-bold text-white"
                    >
                      {expanded ? "إخفاء التسليمات" : "التسليمات والتقييم"}
                    </button>
                  </div>
                </div>
                {expanded ? (
                  <AssignmentSubmissionsPanel
                    courseId={courseId}
                    assignmentId={assignment.id}
                    assignmentTitle={assignment.title}
                    maxScore={assignment.points}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <AppModal
        open={open}
        onClose={() => {
          if (createMutation.isPending) return;
          close();
        }}
        title="إضافة واجب"
        description="حدد العنوان والموعد النهائي ونوع التسليم."
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={close}
              disabled={createMutation.isPending}
              className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="create-assignment-form"
              disabled={createMutation.isPending}
              className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            >
              {createMutation.isPending ? "جاري الحفظ..." : "حفظ الواجب"}
            </button>
          </div>
        }
      >
        <form
          id="create-assignment-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              عنوان الواجب
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: واجب الأسبوع الأول"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              وصف الواجب
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="وصف اختياري"
              rows={3}
              className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              نوع التسليم
            </label>
            <select
              value={submissionType}
              onChange={(event) =>
                setSubmissionType(event.target.value as typeof submissionType)
              }
              className={fieldClass}
            >
              <option value="any">أي نوع</option>
              <option value="text">نص</option>
              <option value="pdf">PDF</option>
              <option value="image">صورة</option>
            </select>
          </div>

          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3">
            <p className="mb-3 text-xs font-semibold text-[#475569]">الموعد النهائي</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#94a3b8]">
                  التاريخ
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#94a3b8]">
                  الوقت
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#94a3b8]">
              الافتراضي للوقت: 11:59 مساءً إن لم تغيّره.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
              الدرجة الكاملة
            </label>
            <input
              type="number"
              min={1}
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              className={fieldClass}
            />
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </form>
      </AppModal>
    </section>
  );
};
