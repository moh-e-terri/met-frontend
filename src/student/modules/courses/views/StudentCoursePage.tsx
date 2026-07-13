import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { markLessonWatched } from "@/core/api/progress";
import { PageMotion } from "@/shared/motion";
import {
  fetchStudentCourseContent,
  getLessonView,
  getLessonsForSidebar,
  studentCourseQueryKeys,
} from "@/student/api/studentCourses";
import { myCoursesQueryKeys } from "@/student/api/myCourses";
import { CourseDiscussions } from "../components/CourseDiscussions";
import { CourseHeroBanner } from "../components/CourseHeroBanner";
import { CourseLessonDetails } from "../components/CourseLessonDetails";
import { CourseLessonsSidebar } from "../components/CourseLessonsSidebar";
import { CoursePageFooter } from "../components/CoursePageFooter";
import { CourseVideoPlayer } from "../components/CourseVideoPlayer";

export const StudentCoursePage = () => {
  const { courseId = "" } = useParams<{ courseId: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const contentQuery = useQuery({
    queryKey: studentCourseQueryKeys.content(courseId),
    queryFn: () => fetchStudentCourseContent(courseId),
    enabled: Boolean(courseId),
  });

  const markCompleteMutation = useMutation({
    mutationFn: (lessonId: string) => markLessonWatched(courseId, lessonId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentCourseQueryKeys.content(courseId) }),
        queryClient.invalidateQueries({ queryKey: ["student", "dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["student", "progress"] }),
        queryClient.invalidateQueries({ queryKey: myCoursesQueryKeys.catalog() }),
      ]);
    },
  });

  useEffect(() => {
    if (contentQuery.data?.activeLesson.id && !selectedLessonId) {
      setSelectedLessonId(contentQuery.data.activeLesson.id);
    }
  }, [contentQuery.data, selectedLessonId]);

  if (!courseId) {
    return <p className="text-center text-sm text-[#64748b]">معرّف الدورة غير موجود.</p>;
  }

  if (contentQuery.isLoading) {
    return (
      <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="h-[420px] animate-pulse rounded-3xl bg-[#e2e8f0]" />
          <div className="h-[420px] animate-pulse rounded-3xl bg-[#e2e8f0]" />
        </div>
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
  const currentLessonId = selectedLessonId ?? content.activeLesson.id;
  const activeLesson = getLessonView(content, currentLessonId);
  const sidebarLessons = getLessonsForSidebar(content, currentLessonId);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <CourseHeroBanner
        title={content.title}
        instructor={content.instructor}
        progressPercent={content.progressPercent}
        completedLessons={content.completedLessons}
        totalLessons={content.totalLessons}
      />

      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <div className="order-2 xl:order-1 xl:row-start-1">
          <CourseLessonsSidebar
            lessons={sidebarLessons}
            totalLessons={content.totalLessons}
            selectedLessonId={currentLessonId}
            onSelectLesson={setSelectedLessonId}
          />
        </div>

        <div className="order-1 min-w-0 space-y-6 xl:order-2 xl:row-start-1">
          <CourseVideoPlayer activeLesson={activeLesson} />
          <CourseLessonDetails
            activeLesson={{
              ...activeLesson,
              id: currentLessonId,
              isCompleted: content.apiLessons.find((lesson) => lesson.id === currentLessonId)
                ?.isCompleted,
            }}
            onMarkComplete={() => markCompleteMutation.mutate(currentLessonId)}
            isMarkingComplete={markCompleteMutation.isPending}
          />
          <CourseDiscussions courseId={courseId} courseTitle={content.title} />
        </div>
      </div>

      <CoursePageFooter />
    </PageMotion>
  );
};
