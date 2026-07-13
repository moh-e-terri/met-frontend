import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourseExam,
  examQueryKeys,
  fetchCourseExams,
  type CourseExam,
} from "@/core/api/exams";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface CourseExamsSectionProps {
  courseId: string;
}

export const CourseExamsSection = ({ courseId }: CourseExamsSectionProps) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [passingScore, setPassingScore] = useState("60");
  const [isPublished, setIsPublished] = useState(true);
  const [showGradesImmediately, setShowGradesImmediately] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const examsQuery = useQuery({
    queryKey: examQueryKeys.list(courseId),
    queryFn: () => fetchCourseExams(courseId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCourseExam(courseId, {
        title: title.trim(),
        duration: duration ? Number(duration) : undefined,
        passingScore: passingScore ? Number(passingScore) : undefined,
        isPublished,
        showGradesImmediately,
        questions: [],
      }),
    onSuccess: async () => {
      setTitle("");
      setDuration("30");
      setPassingScore("60");
      setIsPublished(true);
      setShowGradesImmediately(true);
      setShowForm(false);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: examQueryKeys.list(courseId) });
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "تعذر إنشاء الاختبار",
      );
    },
  });

  const exams = examsQuery.data ?? [];

  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6" dir="rtl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[#0f172a]">الاختبارات</h2>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#3b82f6]"
        >
          <TeacherIcon src="/images/student/icon-add.svg" className="size-4 text-[#3b82f6]" />
          <span>إنشاء اختبار</span>
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
            placeholder="عنوان الاختبار"
            required
            className="h-11 w-full rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
              placeholder="المدة بالدقائق"
              className="h-11 rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(event) => setPassingScore(event.target.value)}
              placeholder="درجة النجاح"
              className="h-11 rounded-2xl border border-[#e2e8f0] bg-white px-4 text-sm outline-none focus:border-[#f5a524]"
            />
          </div>
          <label className="flex items-center justify-end gap-2 text-sm text-[#475569]">
            <span>نشر الاختبار</span>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-end gap-2 text-sm text-[#475569]">
            <span>إظهار الدرجة فوراً</span>
            <input
              type="checkbox"
              checked={showGradesImmediately}
              onChange={(event) => setShowGradesImmediately(event.target.checked)}
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-2xl bg-[#f5a524] py-2.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {createMutation.isPending ? "جاري الحفظ..." : "حفظ الاختبار"}
          </button>
        </form>
      ) : null}

      {examsQuery.isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-[#f8fafc]" />
      ) : exams.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#64748b]">لا توجد اختبارات بعد.</p>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam: CourseExam) => (
            <li
              key={exam.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-4 py-3"
            >
              <div className="min-w-0 text-right">
                <p className="text-sm font-bold text-[#0f172a]">{exam.title}</p>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  {exam.duration} · {exam.questions} سؤال
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-[#64748b]">
                {exam.statusLabel}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
