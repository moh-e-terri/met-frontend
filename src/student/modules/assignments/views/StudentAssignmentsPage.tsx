import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  assignmentQueryKeys,
  buildAssignmentStats,
  fetchCourseAssignments,
  submitCourseAssignment,
} from "@/core/api/assignments";
import { PageMotion } from "@/shared/motion";
import { myCoursesQueryKeys } from "@/student/api/myCourses";
import { studentCourseQueryKeys } from "@/student/api/studentCourses";
import { CoursePageFooter } from "../../courses/components/CoursePageFooter";
import { AssignmentsGrid } from "../components/AssignmentsGrid";
import { AssignmentsPageHeader } from "../components/AssignmentsPageHeader";

function buildSubmitPayload(textAnswer: string) {
  const isUrl = /^https?:\/\//i.test(textAnswer);
  return {
    submissionType: isUrl ? ("pdf" as const) : ("text" as const),
    textAnswer: isUrl ? undefined : textAnswer,
    fileUrl: isUrl ? textAnswer : undefined,
  };
}

export const StudentAssignmentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courseId = "" } = useParams<{ courseId: string }>();
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const assignmentsQuery = useQuery({
    queryKey: assignmentQueryKeys.list(courseId),
    queryFn: () => fetchCourseAssignments(courseId),
    enabled: Boolean(courseId),
  });

  const submitMutation = useMutation({
    mutationFn: async ({
      assignmentId,
      textAnswer,
    }: {
      assignmentId: string;
      textAnswer: string;
    }) => {
      setSubmittingId(assignmentId);
      await submitCourseAssignment(courseId, assignmentId, buildSubmitPayload(textAnswer));
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assignmentQueryKeys.list(courseId) }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.detail(courseId) }),
        queryClient.invalidateQueries({ queryKey: studentCourseQueryKeys.content(courseId) }),
      ]);
    },
    onSettled: () => setSubmittingId(null),
  });

  if (!courseId) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px]">
        <p className="text-center text-sm text-[#64748b]">معرّف الدورة غير موجود.</p>
      </PageMotion>
    );
  }

  if (assignmentsQuery.isLoading) {
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

  if (assignmentsQuery.isError) {
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
          {assignmentsQuery.error instanceof Error
            ? assignmentsQuery.error.message
            : "تعذر تحميل التكليفات"}
        </div>
      </PageMotion>
    );
  }

  const assignments = assignmentsQuery.data ?? [];
  const stats = buildAssignmentStats(assignments);

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

      <AssignmentsPageHeader
        title="تكليفات الدورة"
        subtitle="طبّق ما تعلمته من خلال المشاريع العملية وتابع تقدّمك"
        stats={stats}
      />

      {assignments.length === 0 ? (
        <div className="rounded-3xl border border-[#e2e8f0] bg-white px-6 py-16 text-center shadow-sm" dir="rtl">
          <p className="text-lg font-bold text-[#0f172a]">لا توجد تكليفات بعد</p>
          <p className="mt-2 text-sm text-[#64748b]">
            سيظهر هنا أي واجب يضيفه المحاضر لهذه الدورة.
          </p>
        </div>
      ) : (
        <AssignmentsGrid
          assignments={assignments}
          submittingId={submittingId}
          onSubmit={(assignmentId, textAnswer) =>
            submitMutation.mutateAsync({ assignmentId, textAnswer })
          }
        />
      )}

      {submitMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {submitMutation.error instanceof Error
            ? submitMutation.error.message
            : "تعذر تسليم الواجب"}
        </div>
      ) : null}

      <CoursePageFooter />
    </PageMotion>
  );
};
