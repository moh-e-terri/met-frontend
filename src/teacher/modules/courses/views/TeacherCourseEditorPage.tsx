import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { PageMotion } from "@/shared/motion";
import { fetchCourseLessons, lessonQueryKeys } from "@/core/api/lessons";
import { CoursePlaylistPlayer } from "@/shared/modules/course-workspace";
import {
  courseStudentsQueryKeys,
  fetchCourseStudents,
  fetchInstructorDashboard,
  teacherQueryKeys,
} from "@/teacher/api";
import {
  CourseCurriculumSection,
  mapToCurriculumLessons,
} from "../components/CourseCurriculumSection";
import { CourseAssignmentsSection } from "../components/CourseAssignmentsSection";
import { CourseDataBanner } from "../components/CourseDataBanner";
import { CourseExamsSection } from "../components/CourseExamsSection";
import { CourseEditorSidebar } from "../components/CourseEditorSidebar";
import { CourseStudentsSection } from "../components/CourseStudentsSection";
import { TeacherNewCoursePanel } from "../components/TeacherNewCoursePanel";

export const TeacherCourseEditorPage = () => {
  const { courseId = "new" } = useParams<{ courseId: string }>();
  const basePath = getTeacherBasePath();
  const isExistingCourse = courseId !== "new";
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const dashboardQuery = useQuery({
    queryKey: teacherQueryKeys.dashboard,
    queryFn: fetchInstructorDashboard,
  });

  const lessonsQuery = useQuery({
    queryKey: lessonQueryKeys.list(courseId),
    queryFn: () => fetchCourseLessons(courseId),
    enabled: isExistingCourse,
  });

  const studentsQuery = useQuery({
    queryKey: courseStudentsQueryKeys.list(courseId),
    queryFn: () => fetchCourseStudents(courseId),
    enabled: isExistingCourse,
  });

  const assignedCourse = dashboardQuery.data?.courses.find(
    (course) => course.id === courseId,
  );
  const apiLessons = lessonsQuery.data ?? [];
  const lessons = isExistingCourse ? mapToCurriculumLessons(apiLessons) : [];
  const courseTitle = assignedCourse?.title ?? "المقرر";
  const studentsCount =
    studentsQuery.data?.length != null
      ? String(studentsQuery.data.length)
      : assignedCourse?.students;

  useEffect(() => {
    if (!selectedLessonId && apiLessons[0]?.id) {
      setSelectedLessonId(apiLessons[0].id);
    }
  }, [apiLessons, selectedLessonId]);

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px]">
      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <CourseEditorSidebar
            courses={dashboardQuery.data?.courses ?? []}
            hideCourses={!isExistingCourse}
            communityTo={
              isExistingCourse ? `${basePath}/courses/${courseId}/community` : null
            }
            communityTitle={courseTitle}
          />
        </aside>

        <div className="order-1 min-w-0 space-y-6 xl:order-2 xl:row-start-1">
          {!isExistingCourse ? (
            <TeacherNewCoursePanel
              courses={dashboardQuery.data?.courses ?? []}
              isLoading={dashboardQuery.isLoading}
            />
          ) : null}

          {lessonsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
              {lessonsQuery.error instanceof Error
                ? lessonsQuery.error.message
                : "تعذر تحميل دروس الكورس"}
            </div>
          ) : null}

          {studentsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
              {studentsQuery.error instanceof Error
                ? studentsQuery.error.message
                : "تعذر تحميل طلاب الكورس"}
            </div>
          ) : null}

          {isExistingCourse ? (
            <>
              <CourseDataBanner
                title={courseTitle}
                image={assignedCourse?.image}
                university={assignedCourse?.university}
                students={studentsCount}
                lessons={
                  assignedCourse?.lessons ??
                  (apiLessons.length > 0 ? String(apiLessons.length) : undefined)
                }
              />

              <CoursePlaylistPlayer
                lessons={apiLessons}
                selectedLessonId={selectedLessonId}
                onSelectLesson={setSelectedLessonId}
                isLoading={lessonsQuery.isLoading}
              />

              <CourseStudentsSection
                students={studentsQuery.data ?? []}
                isLoading={studentsQuery.isLoading}
                courseId={courseId}
                studentProfileBasePath={`${basePath}/students`}
              />

              {lessonsQuery.isLoading ? (
                <div className="h-48 animate-pulse rounded-3xl bg-[#e2e8f0]" />
              ) : (
                <CourseCurriculumSection courseId={courseId} lessons={lessons} />
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <CourseAssignmentsSection courseId={courseId} />
                <CourseExamsSection courseId={courseId} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PageMotion>
  );
};
