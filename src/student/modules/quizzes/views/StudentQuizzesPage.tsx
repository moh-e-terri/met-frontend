import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  buildExamStats,
  examQueryKeys,
  fetchCourseExams,
  fetchMyExamResult,
  submitCourseExam,
  type CourseExam,
} from "@/core/api/exams";
import { PageMotion } from "@/shared/motion";
import { myCoursesQueryKeys } from "@/student/api/myCourses";
import { studentCourseQueryKeys } from "@/student/api/studentCourses";
import { CoursePageFooter } from "../../courses/components/CoursePageFooter";
import { QuizzesGrid } from "../components/QuizzesGrid";
import { QuizzesPageHeader } from "../components/QuizzesPageHeader";

export const StudentQuizzesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId = "" } = useParams<{ courseId: string }>();
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const examsQuery = useQuery({
    queryKey: examQueryKeys.list(courseId),
    queryFn: () => fetchCourseExams(courseId),
    enabled: Boolean(courseId),
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      exam,
      writtenAnswer,
    }: {
      exam: CourseExam;
      writtenAnswer: string;
    }) => {
      setLoadingExamId(exam.id);
      const answers =
        exam.rawQuestions && exam.rawQuestions.length > 0
          ? exam.rawQuestions.map((_, index) =>
              index === 0 ? { writtenAnswer } : { mcqAnswer: 0 },
            )
          : [{ writtenAnswer: writtenAnswer || "—" }];

      return submitCourseExam(courseId, exam.id, {
        timeTaken: 60,
        answers,
      });
    },
    onSuccess: async (result) => {
      setResultMessage(
        result.score !== undefined
          ? `تم تقديم الاختبار. درجتك: ${result.score}%`
          : "تم تقديم الاختبار بنجاح.",
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: examQueryKeys.list(courseId) }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.detail(courseId) }),
        queryClient.invalidateQueries({ queryKey: studentCourseQueryKeys.content(courseId) }),
      ]);
    },
    onSettled: () => setLoadingExamId(null),
  });

  const handleViewResult = async (exam: CourseExam) => {
    setLoadingExamId(exam.id);
    setResultMessage(null);
    try {
      const result = await fetchMyExamResult(courseId, exam.id);
      if (result.score !== undefined) {
        const note = result.gradeNote ? `\n${result.gradeNote}` : "";
        setResultMessage(`نتيجتك: ${result.score}%${result.grade ? ` (${result.grade})` : ""}${note}`);
      } else {
        setResultMessage("لا تتوفر نتيجة لهذا الاختبار بعد.");
      }
    } catch (error) {
      setResultMessage(
        error instanceof Error ? error.message : "تعذر جلب نتيجة الاختبار",
      );
    } finally {
      setLoadingExamId(null);
    }
  };

  if (!courseId) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px]">
        <p className="text-center text-sm text-[#64748b]">معرّف الدورة غير موجود.</p>
      </PageMotion>
    );
  }

  if (examsQuery.isLoading) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="h-32 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-3xl bg-[#e2e8f0]" />
          ))}
        </div>
      </PageMotion>
    );
  }

  if (examsQuery.isError) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px] space-y-4">
        <button
          type="button"
          onClick={() => navigate(`/student/my-courses/${courseId}`)}
          className="text-sm font-semibold text-[#f5a524]"
        >
          ← العودة للدورة
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {examsQuery.error instanceof Error
            ? examsQuery.error.message
            : "تعذر تحميل الاختبارات"}
        </div>
      </PageMotion>
    );
  }

  const exams = examsQuery.data ?? [];
  const stats = buildExamStats(exams);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-8">
      <div className="flex justify-end" dir="rtl">
        <Link
          to={`/student/my-courses/${courseId}`}
          className="text-sm font-semibold text-[#f5a524] hover:underline"
        >
          ← العودة للدورة
        </Link>
      </div>

      <QuizzesPageHeader
        title="اختبارات الدورة"
        subtitle="اختبر معرفتك وتابع درجاتك في كل اختبار"
        stats={stats}
      />

      {resultMessage ? (
        <div className="rounded-2xl border border-[#fde8c8] bg-[#fff7ed] px-4 py-3 text-right text-sm text-[#92400e]">
          {resultMessage}
        </div>
      ) : null}

      {exams.length === 0 ? (
        <div className="rounded-3xl border border-[#e2e8f0] bg-white px-6 py-16 text-center shadow-sm" dir="rtl">
          <p className="text-lg font-bold text-[#0f172a]">لا توجد اختبارات بعد</p>
          <p className="mt-2 text-sm text-[#64748b]">
            سيظهر هنا أي اختبار ينشئه المحاضر لهذه الدورة.
          </p>
        </div>
      ) : (
        <QuizzesGrid
          quizzes={exams}
          loadingExamId={loadingExamId}
          onSubmit={(exam, writtenAnswer) =>
            submitMutation.mutateAsync({ exam, writtenAnswer })
          }
          onViewResult={handleViewResult}
        />
      )}

      {submitMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {submitMutation.error instanceof Error
            ? submitMutation.error.message
            : "تعذر تقديم الاختبار"}
        </div>
      ) : null}

      <CoursePageFooter />
    </PageMotion>
  );
};
