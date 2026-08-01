import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCourseAssignments } from "@/core/api/assignments";
import { fetchCourseExams } from "@/core/api/exams";
import { markLessonWatched } from "@/core/api/progress";
import { PageMotion } from "@/shared/motion";
import {
  capabilitiesForRole,
  CourseAssessmentsGrid,
  CourseCommunityCard,
  CourseLecturerCard,
  CoursePlaylistPlayer,
} from "@/shared/modules/course-workspace";
import {
  fetchStudentCourseContent,
  studentCourseQueryKeys,
} from "@/student/api/studentCourses";
import { myCoursesQueryKeys } from "@/student/api/myCourses";
import { CoursePageFooter } from "../components/CoursePageFooter";

export const StudentCoursePage = () => {
  const { courseId = "" } = useParams<{ courseId: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const capabilities = capabilitiesForRole("student", courseId);

  const contentQuery = useQuery({
    queryKey: studentCourseQueryKeys.content(courseId),
    queryFn: () => fetchStudentCourseContent(courseId),
    enabled: Boolean(courseId),
  });

  const examsQuery = useQuery({
    queryKey: ["courses", courseId, "exams"],
    queryFn: () => fetchCourseExams(courseId),
    enabled: Boolean(courseId),
  });

  const assignmentsQuery = useQuery({
    queryKey: ["courses", courseId, "assignments"],
    queryFn: () => fetchCourseAssignments(courseId),
    enabled: Boolean(courseId),
  });

  const markCompleteMutation = useMutation({
    mutationFn: (lessonId: string) => markLessonWatched(courseId, lessonId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentCourseQueryKeys.content(courseId),
        }),
        queryClient.invalidateQueries({ queryKey: ["student", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.catalog() }),
      ]);
    },
  });

  const lessons = useMemo(
    () => contentQuery.data?.apiLessons ?? [],
    [contentQuery.data],
  );

  useEffect(() => {
    if (!selectedLessonId && lessons[0]?.id) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  if (!courseId) {
    return <p className="text-center text-sm text-[#64748b]">معرّف الدورة غير موجود.</p>;
  }

  if (contentQuery.isLoading) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        <div className="h-[420px] animate-pulse rounded-3xl bg-[#e2e8f0]" />
      </PageMotion>
    );
  }

  if (contentQuery.isError || !contentQuery.data) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px]">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {contentQuery.error instanceof Error
            ? contentQuery.error.message
            : "تعذر تحميل محتوى الدورة"}
        </div>
      </PageMotion>
    );
  }

  const content = contentQuery.data;
  const currentLessonId = selectedLessonId ?? lessons[0]?.id ?? "";
  const activeLesson = lessons.find((lesson) => lesson.id === currentLessonId);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <section
        className="rounded-[28px] border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        dir="rtl"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-[#f5a524]">تعلّم المقرر</p>
            <h1 className="mt-1 text-2xl font-black text-[#0f172a] sm:text-3xl">
              {content.title}
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              المحاضر: {content.instructor} · التقدم {content.progressPercent}%
            </p>
          </div>
          <Link
            to={`/student/my-courses/${courseId}`}
            className="rounded-2xl border border-[#e2e8f0] px-4 py-2 text-sm font-bold text-[#0f172a]"
          >
            لوحة دورتي
          </Link>
        </div>
      </section>

      <CoursePlaylistPlayer
        lessons={lessons}
        selectedLessonId={currentLessonId || null}
        onSelectLesson={setSelectedLessonId}
      />

      {activeLesson ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e2e8f0] bg-white px-5 py-4" dir="rtl">
          <div className="text-right">
            <p className="text-sm font-bold text-[#0f172a]">{activeLesson.title}</p>
            <p className="text-xs text-[#94a3b8]">
              {activeLesson.isCompleted ? "مكتمل" : "يمكنك تعليم الدرس كمكتمل بعد المشاهدة"}
            </p>
          </div>
          <button
            type="button"
            disabled={markCompleteMutation.isPending || activeLesson.isCompleted}
            onClick={() => markCompleteMutation.mutate(activeLesson.id)}
            className="rounded-2xl bg-[#14b8a6] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {activeLesson.isCompleted
              ? "تم الإكمال"
              : markCompleteMutation.isPending
                ? "جاري الحفظ..."
                : "تعليم كمكتمل"}
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <CourseAssessmentsGrid
          exams={examsQuery.data ?? []}
          assignments={assignmentsQuery.data ?? []}
          capabilities={capabilities}
          isLoading={examsQuery.isLoading || assignmentsQuery.isLoading}
        />
        <CourseLecturerCard
          name={content.instructor}
          avatar={content.instructorAvatar}
          lecturerId={content.instructorId}
          chatsPath="/student/chats"
          courseId={courseId}
        />
      </div>

      <CourseCommunityCard
        to={capabilities.communityPath}
        courseTitle={content.title}
      />

      <CoursePageFooter />
    </PageMotion>
  );
};
