import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCourseExam,
  examQueryKeys,
  fetchCourseExams,
  normalizeExamQuestions,
  type CourseExam,
  type ExamQuestionInput,
  type ExamQuestionType,
} from "@/core/api/exams";
import { isApiError } from "@/core/api/client";
import { AppModal } from "@/shared/components/AppModal";
import { cn } from "@/shared/utils/cn";
import { TeacherIcon } from "../../dashboard/components/TeacherIcon";

interface CourseExamsSectionProps {
  courseId: string;
}

interface DraftQuestion {
  id: string;
  questionText: string;
  questionType: ExamQuestionType;
  options: string[];
  correctAnswer: number;
  points: string;
}

type FormStep = "edit" | "review";

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none transition-colors focus:border-[#f5a524] focus:bg-white";

function newDraftQuestion(index = 0): DraftQuestion {
  return {
    id: `q-${Date.now()}-${index}`,
    questionText: "",
    questionType: "mcq",
    options: ["", "", "", ""],
    correctAnswer: 0,
    points: "1",
  };
}

function toApiQuestions(drafts: DraftQuestion[]): ExamQuestionInput[] {
  return drafts.map((draft) => ({
    questionText: draft.questionText,
    questionType: draft.questionType,
    options: draft.questionType === "mcq" ? draft.options : undefined,
    correctAnswer: draft.questionType === "mcq" ? draft.correctAnswer : null,
    points: Number(draft.points) || 1,
  }));
}

export const CourseExamsSection = ({ courseId }: CourseExamsSectionProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormStep>("edit");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");
  const [passingScore, setPassingScore] = useState("60");
  const [showGradesImmediately, setShowGradesImmediately] = useState(true);
  const [questions, setQuestions] = useState<DraftQuestion[]>([newDraftQuestion()]);
  const [error, setError] = useState<string | null>(null);

  const examsQuery = useQuery({
    queryKey: examQueryKeys.list(courseId),
    queryFn: () => fetchCourseExams(courseId),
  });

  const resetForm = () => {
    setStep("edit");
    setTitle("");
    setDuration("30");
    setPassingScore("60");
    setShowGradesImmediately(true);
    setQuestions([newDraftQuestion()]);
    setError(null);
  };

  const close = () => {
    setOpen(false);
    resetForm();
  };

  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) =>
      prev.map((question) => (question.id === id ? { ...question, ...patch } : question)),
    );
  };

  const updateOption = (id: string, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((question) => {
        if (question.id !== id) return question;
        const options = [...question.options];
        options[optionIndex] = value;
        return { ...question, options };
      }),
    );
  };

  const goToReview = () => {
    setError(null);
    try {
      if (!title.trim()) {
        throw new Error("عنوان الاختبار مطلوب");
      }
      if (!duration || Number(duration) <= 0) {
        throw new Error("حدد مدة الاختبار بالدقائق");
      }
      normalizeExamQuestions(toApiQuestions(questions));
      setStep("review");
    } catch (reviewError) {
      setError(
        reviewError instanceof Error ? reviewError.message : "راجع الأسئلة قبل المتابعة",
      );
    }
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createCourseExam(courseId, {
        title: title.trim(),
        duration: duration ? Number(duration) : undefined,
        passingScore: passingScore ? Number(passingScore) : undefined,
        isPublished: true,
        showGradesImmediately,
        questions: toApiQuestions(questions),
      }),
    onSuccess: async () => {
      close();
      await queryClient.invalidateQueries({ queryKey: examQueryKeys.list(courseId) });
    },
    onError: (mutationError) => {
      setError(
        isApiError(mutationError)
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : "تعذر إنشاء الاختبار",
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
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#eff6ff] px-4 py-2.5 text-sm font-semibold text-[#3b82f6]"
        >
          <TeacherIcon src="/images/student/icon-add.svg" className="size-4 text-[#3b82f6]" />
          <span>إنشاء اختبار</span>
        </button>
      </div>

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
                  {exam.isPublished === false ? " · غير منشور" : " · منشور"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-[#64748b]">
                {exam.statusLabel}
              </span>
            </li>
          ))}
        </ul>
      )}

      <AppModal
        open={open}
        size="lg"
        onClose={() => {
          if (createMutation.isPending) return;
          close();
        }}
        title={step === "edit" ? "إنشاء اختبار" : "مراجعة الأسئلة"}
        description={
          step === "edit"
            ? "أضف العنوان والأسئلة، ثم راجعها قبل الاعتماد والنشر."
            : "تأكد من صحة الأسئلة والإجابات ثم اعتمد الاختبار للنشر."
        }
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            {step === "edit" ? (
              <>
                <button
                  type="button"
                  onClick={close}
                  disabled={createMutation.isPending}
                  className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={goToReview}
                  className="rounded-2xl bg-[#0f172a] px-5 py-2.5 text-sm font-bold text-white"
                >
                  مراجعة الأسئلة
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("edit");
                  }}
                  disabled={createMutation.isPending}
                  className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
                >
                  تعديل الأسئلة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    createMutation.mutate();
                  }}
                  disabled={createMutation.isPending}
                  className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
                >
                  {createMutation.isPending ? "جاري النشر..." : "اعتماد ونشر"}
                </button>
              </>
            )}
          </div>
        }
      >
        {step === "edit" ? (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                عنوان الاختبار
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="مثال: اختبار الوحدة الأولى"
                required
                className={fieldClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                  المدة (دقيقة)
                </label>
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  required
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                  درجة النجاح (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(event) => setPassingScore(event.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <label className="flex items-center justify-end gap-2 text-sm text-[#475569]">
              <span>إظهار الدرجة فوراً للطالب</span>
              <input
                type="checkbox"
                checked={showGradesImmediately}
                onChange={(event) => setShowGradesImmediately(event.target.checked)}
              />
            </label>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0f172a]">الأسئلة ({questions.length})</h4>

              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="space-y-3 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#0f172a]">سؤال {index + 1}</p>
                    {questions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((prev) => prev.filter((item) => item.id !== question.id))
                        }
                        className="text-xs font-semibold text-red-500"
                      >
                        حذف
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_100px]">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                        نص السؤال
                      </label>
                      <input
                        value={question.questionText}
                        onChange={(event) =>
                          updateQuestion(question.id, { questionText: event.target.value })
                        }
                        placeholder="اكتب نص السؤال..."
                        required
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                        النوع
                      </label>
                      <select
                        value={question.questionType}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            questionType: event.target.value as ExamQuestionType,
                            options:
                              event.target.value === "mcq"
                                ? question.options.length >= 4
                                  ? question.options
                                  : ["", "", "", ""]
                                : question.options,
                          })
                        }
                        className={fieldClass}
                      >
                        <option value="mcq">اختيار متعدد</option>
                        <option value="written">مقالي</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#475569]">
                        النقاط
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={question.points}
                        onChange={(event) =>
                          updateQuestion(question.id, { points: event.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  {question.questionType === "mcq" ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#475569]">
                        الخيارات (4–7) — اختر الإجابة الصحيحة
                      </p>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() =>
                              updateQuestion(question.id, { correctAnswer: optionIndex })
                            }
                            className="size-4 accent-[#f5a524]"
                            aria-label={`الإجابة الصحيحة خيار ${optionIndex + 1}`}
                          />
                          <input
                            value={option}
                            onChange={(event) =>
                              updateOption(question.id, optionIndex, event.target.value)
                            }
                            placeholder={`خيار ${optionIndex + 1}`}
                            required
                            className={fieldClass}
                          />
                          {question.options.length > 4 ? (
                            <button
                              type="button"
                              onClick={() => {
                                const next = question.options.filter((_, i) => i !== optionIndex);
                                updateQuestion(question.id, {
                                  options: next,
                                  correctAnswer: Math.min(
                                    question.correctAnswer,
                                    Math.max(0, next.length - 1),
                                  ),
                                });
                              }}
                              className="shrink-0 text-xs text-red-500"
                            >
                              حذف
                            </button>
                          ) : null}
                        </div>
                      ))}
                      {question.options.length < 7 ? (
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(question.id, {
                              options: [...question.options, ""],
                            })
                          }
                          className="text-xs font-semibold text-[#3b82f6]"
                        >
                          + خيار إضافي
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-white px-3 py-2 text-xs text-[#64748b]">
                      سؤال مقالي — يصحّحه المدرّس لاحقاً (بدون خيارات).
                    </p>
                  )}
                </div>
              ))}

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((prev) => [...prev, newDraftQuestion(prev.length)])
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] px-4 py-2 text-sm font-semibold text-[#3b82f6] transition-colors hover:bg-[#dbeafe]"
                >
                  <span aria-hidden>+</span>
                  إضافة سؤال
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5" dir="rtl">
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <h3 className="text-lg font-black text-[#0f172a]">{title.trim()}</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#64748b]">
                <span className="rounded-full bg-white px-3 py-1">
                  المدة: {duration} دقيقة
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  النجاح: {passingScore || "—"}%
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  الأسئلة: {questions.length}
                </span>
                <span className="rounded-full bg-white px-3 py-1">
                  الدرجة فوراً: {showGradesImmediately ? "نعم" : "لا"}
                </span>
              </div>
            </div>

            <ul className="space-y-3">
              {questions.map((question, index) => (
                <li
                  key={question.id}
                  className="rounded-2xl border border-[#e2e8f0] bg-white p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#0f172a]">
                      سؤال {index + 1}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        question.questionType === "mcq"
                          ? "bg-[#eff6ff] text-[#2563eb]"
                          : "bg-[#f5f3ff] text-[#7c3aed]",
                      )}
                    >
                      {question.questionType === "mcq" ? "اختيار متعدد" : "مقالي"} ·{" "}
                      {question.points || 1} نقطة
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-[#334155]">{question.questionText}</p>
                  {question.questionType === "mcq" ? (
                    <ul className="mt-3 space-y-1.5">
                      {question.options.map((option, optionIndex) => (
                        <li
                          key={optionIndex}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm",
                            question.correctAnswer === optionIndex
                              ? "bg-[#ecfdf5] font-semibold text-[#0f766e]"
                              : "bg-[#f8fafc] text-[#475569]",
                          )}
                        >
                          {option}
                          {question.correctAnswer === optionIndex ? " ✓" : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-[#94a3b8]">
                      يُصحَّح يدوياً من المدرّس بعد تسليم الطالب.
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            ) : null}
          </div>
        )}
      </AppModal>
    </section>
  );
};
