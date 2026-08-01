import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  examQueryKeys,
  fetchCourseExam,
  fetchMyExamResult,
  submitCourseExam,
  type ExamQuestionDetail,
  type ExamResult,
  type SubmitExamPayload,
} from "@/core/api/exams";
import { PageMotion } from "@/shared/motion";
import { cn } from "@/shared/utils/cn";
import { myCoursesQueryKeys } from "@/student/api/myCourses";
import { studentCourseQueryKeys } from "@/student/api/studentCourses";
import { StudentIcon } from "../../dashboard/components/StudentIcon";

type Phase = "intro" | "taking" | "done";

type AnswerDraft = {
  mcqAnswer?: number;
  writtenAnswer?: string;
};

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function isAnswerFilled(question: ExamQuestionDetail, answer?: AnswerDraft): boolean {
  if (!answer) return false;
  if (question.questionType === "mcq") {
    return typeof answer.mcqAnswer === "number";
  }
  return Boolean(answer.writtenAnswer?.trim());
}

function buildSubmitAnswers(
  questions: ExamQuestionDetail[],
  drafts: AnswerDraft[],
): SubmitExamPayload["answers"] {
  return questions.map((question, index) => {
    const draft = drafts[index];
    if (question.questionType === "written") {
      return { writtenAnswer: draft?.writtenAnswer?.trim() || "" };
    }
    return {
      mcqAnswer: typeof draft?.mcqAnswer === "number" ? draft.mcqAnswer : 0,
    };
  });
}

function ResultPanel({
  examTitle,
  result,
  onBack,
}: {
  examTitle: string;
  result: ExamResult;
  onBack: () => void;
}) {
  const pendingReview = result.isFullyGraded === false || result.score === undefined;

  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8" dir="rtl">
      <p className="text-xs font-semibold text-[#f5a524]">نتيجة الاختبار</p>
      <h1 className="mt-2 text-2xl font-black text-[#0f172a]">{examTitle}</h1>

      {pendingReview ? (
        <div className="mt-6 rounded-2xl bg-[#fff7ed] px-5 py-4 text-right">
          <p className="text-base font-bold text-[#92400e]">تم التقديم — قيد المراجعة</p>
          <p className="mt-1 text-sm text-[#b45309]">
            {result.message ||
              "الأسئلة المقالية تحتاج مراجعة المدرّس قبل ظهور الدرجة النهائية."}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-[#f8fafc] px-5 py-5">
          <div>
            <p className="text-xs text-[#64748b]">درجتك</p>
            <p className="text-4xl font-black text-[#0f172a]" dir="ltr">
              {result.score}%
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-bold",
              result.passed
                ? "bg-[#ecfdf5] text-[#0f766e]"
                : "bg-[#fef2f2] text-[#b91c1c]",
            )}
          >
            {result.passed ? "ناجح" : "غير ناجح"}
          </span>
        </div>
      )}

      {result.message && !pendingReview ? (
        <p className="mt-4 text-sm text-[#64748b]">{result.message}</p>
      ) : null}

      <button
        type="button"
        onClick={onBack}
        className="mt-8 w-full rounded-2xl bg-[#0f172a] py-3 text-sm font-bold text-white hover:bg-[#1e293b]"
      >
        العودة لقائمة الاختبارات
      </button>
    </div>
  );
}

export const StudentQuizTakePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId = "", examId = "" } = useParams<{
    courseId: string;
    examId: string;
  }>();

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerDraft[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoSubmitRef = useRef(false);
  const submittingRef = useRef(false);
  const answersRef = useRef<AnswerDraft[]>([]);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    startedAtRef.current = startedAt;
  }, [startedAt]);

  const examQuery = useQuery({
    queryKey: examQueryKeys.detail(courseId, examId),
    queryFn: () => fetchCourseExam(courseId, examId),
    enabled: Boolean(courseId && examId),
  });

  const existingResultQuery = useQuery({
    queryKey: examQueryKeys.result(courseId, examId),
    queryFn: () => fetchMyExamResult(courseId, examId),
    enabled: Boolean(courseId && examId),
    retry: false,
  });

  const exam = examQuery.data;
  const questions = exam?.questionDetails ?? [];

  useEffect(() => {
    if (existingResultQuery.data?.exists) {
      setResult(existingResultQuery.data);
      setPhase("done");
    }
  }, [existingResultQuery.data]);

  useEffect(() => {
    if (phase !== "taking") return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitExamPayload) =>
      submitCourseExam(courseId, examId, payload),
    onSuccess: async (submitResult) => {
      setResult(submitResult);
      setPhase("done");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: examQueryKeys.list(courseId) }),
        queryClient.invalidateQueries({
          queryKey: examQueryKeys.result(courseId, examId),
        }),
        queryClient.invalidateQueries({
          queryKey: myCoursesQueryKeys.detail(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: studentCourseQueryKeys.content(courseId),
        }),
      ]);
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "تعذر تقديم الاختبار",
      );
      submittingRef.current = false;
    },
  });

  const submitAnswers = async (forced: boolean) => {
    if (!exam || submittingRef.current || questions.length === 0) return;

    const currentAnswers = answersRef.current;
    if (!forced) {
      const unanswered = questions.filter((q, i) => !isAnswerFilled(q, currentAnswers[i]));
      if (unanswered.length > 0) {
        const confirmSubmit = window.confirm(
          `هناك ${unanswered.length} سؤال بدون إجابة. هل تريد التقديم الآن؟`,
        );
        if (!confirmSubmit) return;
      }
    }

    submittingRef.current = true;
    setErrorMessage(null);
    const started = startedAtRef.current;
    const elapsed = started
      ? Math.max(1, Math.round((Date.now() - started) / 1000))
      : 1;

    await submitMutation.mutateAsync({
      timeTaken: elapsed,
      answers: buildSubmitAnswers(questions, currentAnswers),
    });
  };

  const submitAnswersRef = useRef(submitAnswers);
  submitAnswersRef.current = submitAnswers;

  useEffect(() => {
    if (phase !== "taking") return;

    if (secondsLeft <= 0) {
      if (!autoSubmitRef.current) {
        autoSubmitRef.current = true;
        void submitAnswersRef.current(true);
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, secondsLeft]);

  const startQuiz = () => {
    if (!exam || questions.length === 0) return;
    const minutes = exam.durationMinutes > 0 ? exam.durationMinutes : 10;
    setAnswers(questions.map(() => ({})));
    setCurrentIndex(0);
    setSecondsLeft(minutes * 60);
    setStartedAt(Date.now());
    setErrorMessage(null);
    autoSubmitRef.current = false;
    submittingRef.current = false;
    setPhase("taking");
  };

  const updateAnswer = (patch: AnswerDraft) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], ...patch };
      return next;
    });
  };

  const backToList = () => navigate(`/student/my-courses/${courseId}/quizzes`);

  if (!courseId || !examId) {
    return (
      <PageMotion className="mx-auto w-full max-w-3xl">
        <p className="text-center text-sm text-[#64748b]">معرّف الاختبار غير موجود.</p>
      </PageMotion>
    );
  }

  if (examQuery.isLoading || existingResultQuery.isLoading) {
    return (
      <PageMotion className="mx-auto w-full max-w-3xl space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-[#e2e8f0]" />
        <div className="h-80 animate-pulse rounded-3xl bg-[#e2e8f0]" />
      </PageMotion>
    );
  }

  if (examQuery.isError || !exam) {
    return (
      <PageMotion className="mx-auto w-full max-w-3xl space-y-4" dir="rtl">
        <Link
          to={`/student/my-courses/${courseId}/quizzes`}
          className="text-sm font-semibold text-[#f5a524] hover:underline"
        >
          ← العودة للاختبارات
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {examQuery.error instanceof Error
            ? examQuery.error.message
            : "تعذر تحميل الاختبار"}
        </div>
      </PageMotion>
    );
  }

  if (phase === "done" && result) {
    return (
      <PageMotion className="mx-auto w-full max-w-3xl space-y-4">
        <div className="flex justify-end" dir="rtl">
          <Link
            to={`/student/my-courses/${courseId}/quizzes`}
            className="text-sm font-semibold text-[#f5a524] hover:underline"
          >
            ← العودة للاختبارات
          </Link>
        </div>
        <ResultPanel examTitle={exam.title} result={result} onBack={backToList} />
      </PageMotion>
    );
  }

  const current = questions[currentIndex];
  const answeredCount = questions.filter((q, i) => isAnswerFilled(q, answers[i])).length;
  const timerUrgent = secondsLeft <= 60;
  const isLast = currentIndex === questions.length - 1;

  return (
    <PageMotion className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex justify-end" dir="rtl">
        <Link
          to={`/student/my-courses/${courseId}/quizzes`}
          className="text-sm font-semibold text-[#f5a524] hover:underline"
        >
          ← العودة للاختبارات
        </Link>
      </div>

      {errorMessage ? (
        <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          <p>{errorMessage}</p>
          {phase === "taking" && secondsLeft <= 0 ? (
            <button
              type="button"
              onClick={() => {
                autoSubmitRef.current = false;
                submittingRef.current = false;
                void submitAnswersRef.current(true);
              }}
              className="font-bold underline"
            >
              إعادة محاولة التقديم
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === "intro" ? (
        <section
          className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8"
          dir="rtl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-[#f5f3ff] px-2.5 py-1 text-[10px] font-semibold text-[#8b5cf6]">
              {exam.category}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                exam.statusClassName,
              )}
            >
              {exam.statusLabel}
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black text-[#0f172a] sm:text-3xl">
            {exam.title}
          </h1>
          {exam.description ? (
            <p className="mt-2 text-sm leading-7 text-[#64748b]">{exam.description}</p>
          ) : (
            <p className="mt-2 text-sm leading-7 text-[#64748b]">
              راجع التفاصيل ثم ابدأ الاختبار. سيبدأ العدّ التنازلي فور البدء.
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "عدد الأسئلة", value: `${questions.length}` },
              { label: "المدة", value: exam.duration },
              {
                label: "درجة النجاح",
                value: exam.passingScore !== undefined ? `${exam.passingScore}%` : "—",
              },
              { label: "الصعوبة", value: exam.difficulty },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-center"
              >
                <p className="text-[11px] text-[#94a3b8]">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-[#0f172a]" dir="ltr">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[#fde8c8] bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]">
            بعد الضغط على «ابدأ الاختبار» سيظهر العدّ التنازلي، وستُعرض الأسئلة واحداً تلو
            الآخر. عند انتهاء الوقت يُقدَّم الاختبار تلقائياً.
          </div>

          <button
            type="button"
            onClick={startQuiz}
            disabled={questions.length === 0}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] py-3.5 text-sm font-bold text-white transition hover:bg-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <StudentIcon
              src="/images/student/icon-play.svg"
              className="size-4 text-white"
            />
            ابدأ الاختبار
          </button>
        </section>
      ) : null}

      {phase === "taking" && current ? (
        <section className="space-y-4" dir="rtl">
          <div
            className={cn(
              "sticky top-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm backdrop-blur",
              timerUrgent
                ? "border-red-200 bg-red-50/95"
                : "border-[#e2e8f0] bg-white/95",
            )}
          >
            <div className="text-right">
              <p className="text-xs text-[#64748b]">{exam.title}</p>
              <p className="text-sm font-bold text-[#0f172a]">
                سؤال {currentIndex + 1} من {questions.length}
              </p>
            </div>
            <div className="text-left" dir="ltr">
              <p className="text-[11px] text-[#94a3b8]">الوقت المتبقي</p>
              <p
                className={cn(
                  "font-mono text-2xl font-black tabular-nums",
                  timerUrgent ? "text-red-600" : "text-[#0f172a]",
                )}
              >
                {formatCountdown(secondsLeft)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "size-8 rounded-lg text-xs font-bold transition",
                  index === currentIndex
                    ? "bg-[#0f172a] text-white"
                    : isAnswerFilled(question, answers[index])
                      ? "bg-[#f5a524] text-white"
                      : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]",
                )}
                aria-label={`السؤال ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <article className="rounded-3xl border border-[#e2e8f0] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  current.questionType === "mcq"
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#f5f3ff] text-[#7c3aed]",
                )}
              >
                {current.questionType === "mcq" ? "اختيار من متعدد" : "مقالي"}
              </span>
              <span className="text-xs text-[#94a3b8]">{current.points} نقطة</span>
            </div>

            <h2 className="text-lg font-bold leading-8 text-[#0f172a] sm:text-xl">
              {current.questionText}
            </h2>

            {current.questionType === "mcq" ? (
              <div className="mt-6 space-y-2">
                {current.options.map((option, optionIndex) => {
                  const selected = answers[currentIndex]?.mcqAnswer === optionIndex;
                  return (
                    <label
                      key={`${current.id}-${optionIndex}`}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition",
                        selected
                          ? "border-[#f5a524] bg-[#fff7ed]"
                          : "border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc]",
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${current.id}`}
                        checked={selected}
                        onChange={() => updateAnswer({ mcqAnswer: optionIndex })}
                        className="mt-1 accent-[#f5a524]"
                      />
                      <span className="text-sm leading-6 text-[#334155]">{option}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[currentIndex]?.writtenAnswer ?? ""}
                onChange={(event) =>
                  updateAnswer({ writtenAnswer: event.target.value })
                }
                rows={8}
                placeholder="اكتب إجابتك هنا..."
                className="mt-6 w-full resize-y rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm leading-7 text-[#0f172a] outline-none focus:border-[#f5a524] focus:bg-white"
              />
            )}
          </article>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#64748b]">
              تمت الإجابة على {answeredCount} من {questions.length}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={currentIndex === 0 || submitMutation.isPending}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] disabled:opacity-40"
              >
                السابق
              </button>
              {!isLast ? (
                <button
                  type="button"
                  disabled={submitMutation.isPending}
                  onClick={() =>
                    setCurrentIndex((index) =>
                      Math.min(questions.length - 1, index + 1),
                    )
                  }
                  className="rounded-xl bg-[#0f172a] px-5 py-2.5 text-sm font-bold text-white"
                >
                  التالي
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitMutation.isPending}
                  onClick={() => void submitAnswers(false)}
                  className="rounded-xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                >
                  {submitMutation.isPending ? "جاري التقديم..." : "تقديم الاختبار"}
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </PageMotion>
  );
};
