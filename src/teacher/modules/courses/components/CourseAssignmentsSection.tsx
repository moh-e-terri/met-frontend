import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignmentQueryKeys,
  createCourseAssignment,
  fetchCourseAssignments,
  type CourseAssignment,
} from "@/core/api/assignments";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface CourseAssignmentsSectionProps {
  courseId: string;
}

export const CourseAssignmentsSection = ({ courseId }: CourseAssignmentsSectionProps) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submissionType, setSubmissionType] = useState<"any" | "pdf" | "image" | "text">("any");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [error, setError] = useState<string | null>(null);

  const assignmentsQuery = useQuery({
    queryKey: assignmentQueryKeys.list(courseId),
    queryFn: () => fetchCourseAssignments(courseId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCourseAssignment(courseId, {
        title: title.trim(),
        description: description.trim() || undefined,
        submissionType,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        maxScore: maxScore ? Number(maxScore) : undefined,
      }),
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxScore("100");
      setSubmissionType("any");
      setShowForm(false);
      setError(null);
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
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#3b82f6]"
        >
          <TeacherIcon src="/images/student/icon-add.svg" className="size-4 text-[#3b82f6]" />
          <span>إضافة واجب</span>
        </button>
      </div>

      {showForm ? (
        <form
          className="mb-5 space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="عنوان الواجب"
            required
            className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="وصف الواجب (اختياري)"
            rows={3}
            className="w-full resize-none rounded-2xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm outline-none focus:border-[#f5a524]"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <select
              value={submissionType}
              onChange={(event) =>
                setSubmissionType(event.target.value as typeof submissionType)
              }
              className="h-11 rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            >
              <option value="any">أي نوع</option>
              <option value="text">نص</option>
              <option value="pdf">PDF</option>
              <option value="image">صورة</option>
            </select>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="h-11 rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
            <input
              type="number"
              min={1}
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              placeholder="الدرجة الكاملة"
              className="h-11 rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-2xl bg-[#f5a524] py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {createMutation.isPending ? "جاري الحفظ..." : "حفظ الواجب"}
          </button>
        </form>
      ) : null}

      {assignmentsQuery.isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : assignments.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد واجبات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {assignments.map((assignment: CourseAssignment) => (
            <li
              key={assignment.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3"
            >
              <div className="min-w-0 text-right">
                <p className="text-sm font-bold text-[#0f172a]">{assignment.title}</p>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  {assignment.deadline} · {assignment.points} نقطة
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-[#64748b]">
                {assignment.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
