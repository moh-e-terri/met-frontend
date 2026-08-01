import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseAssignments } from "@/core/api/assignments";
import {
  courseEnrolleeQueryKeys,
  fetchAdminCourseStudents,
  fetchInstructorCourseStudents,
} from "@/core/api/courseEnrollees";
import { fetchCourseExams } from "@/core/api/exams";
import { fetchCourseLessons, lessonQueryKeys } from "@/core/api/lessons";
import { PageMotion } from "@/shared/motion";
import { CourseAssessmentsGrid } from "./CourseAssessmentsGrid";
import { CourseCommunityCard } from "./CourseCommunityCard";
import { CourseLecturerCard } from "./CourseLecturerCard";
import { CoursePlaylistPlayer } from "./CoursePlaylistPlayer";
import { CourseStudentsPanel } from "./CourseStudentsPanel";
import { CourseWorkspaceHero } from "./CourseWorkspaceHero";
import type { CourseWorkspaceCapabilities, CourseWorkspaceMeta } from "./types";

interface CourseWorkspaceProps {
  meta: CourseWorkspaceMeta;
  capabilities: CourseWorkspaceCapabilities;
  backLink?: ReactNode;
}

export const CourseWorkspace = ({
  meta,
  capabilities,
  backLink,
}: CourseWorkspaceProps) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const lessonsQuery = useQuery({
    queryKey: lessonQueryKeys.list(meta.id),
    queryFn: () => fetchCourseLessons(meta.id),
    enabled: Boolean(meta.id),
  });

  const studentsQuery = useQuery({
    queryKey:
      capabilities.studentsSource === "admin"
        ? courseEnrolleeQueryKeys.admin(meta.id)
        : courseEnrolleeQueryKeys.instructor(meta.id),
    queryFn: () =>
      capabilities.studentsSource === "admin"
        ? fetchAdminCourseStudents(meta.id)
        : fetchInstructorCourseStudents(meta.id),
    enabled: Boolean(meta.id) && capabilities.showStudents,
  });

  const examsQuery = useQuery({
    queryKey: ["courses", meta.id, "exams"],
    queryFn: () => fetchCourseExams(meta.id),
    enabled: Boolean(meta.id) && capabilities.showAssessments,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["courses", meta.id, "assignments"],
    queryFn: () => fetchCourseAssignments(meta.id),
    enabled: Boolean(meta.id) && capabilities.showAssessments,
  });

  const lessons = useMemo(() => {
    const all = lessonsQuery.data ?? [];
    if (capabilities.canManageContent || capabilities.studentsSource === "admin") {
      return all;
    }
    return all.filter((lesson) => lesson.isPublished !== false);
  }, [lessonsQuery.data, capabilities.canManageContent, capabilities.studentsSource]);

  useEffect(() => {
    if (!selectedLessonId && lessons[0]?.id) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  const students = studentsQuery.data ?? [];

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      {backLink}

      <CourseWorkspaceHero
        meta={meta}
        capabilities={capabilities}
        lessonsCount={lessons.length}
        studentsCount={students.length || meta.enrolledCount || 0}
      />

      {(lessonsQuery.isError || studentsQuery.isError || examsQuery.isError || assignmentsQuery.isError) && (
        <div className="space-y-2">
          {lessonsQuery.isError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
              {lessonsQuery.error instanceof Error
                ? lessonsQuery.error.message
                : "تعذر تحميل الدروس"}
            </p>
          ) : null}
        </div>
      )}

      <CoursePlaylistPlayer
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        onSelectLesson={setSelectedLessonId}
        isLoading={lessonsQuery.isLoading}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        {capabilities.showStudents ? (
          <CourseStudentsPanel
            students={students}
            isLoading={studentsQuery.isLoading}
            chatsPath={
              capabilities.studentsSource === "admin"
                ? "/admin/chats"
                : "/teacher/chats"
            }
            studentProfileBasePath={
              capabilities.studentsSource === "admin"
                ? "/admin/students"
                : "/teacher/students"
            }
            profileIdMode={
              capabilities.studentsSource === "admin" ? "profile" : "user"
            }
            courseId={meta.id}
            error={
              studentsQuery.isError
                ? studentsQuery.error instanceof Error
                  ? studentsQuery.error.message
                  : "تعذر تحميل الطلاب"
                : null
            }
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] p-6 text-right text-sm text-[#64748b]">
            قائمة الطلاب غير متاحة لصلاحيتك الحالية.
          </div>
        )}

        {capabilities.showLecturer ? (
          <CourseLecturerCard
            name={meta.lecturerName}
            avatar={meta.lecturerAvatar}
            university={meta.university}
            lecturerId={meta.lecturerId}
            courseId={meta.id}
            chatsPath={
              capabilities.studentsSource === "admin"
                ? "/admin/chats"
                : capabilities.canMarkProgress
                  ? "/student/chats"
                  : "/teacher/chats"
            }
          />
        ) : null}
      </div>

      <CourseAssessmentsGrid
        exams={examsQuery.data ?? []}
        assignments={assignmentsQuery.data ?? []}
        capabilities={capabilities}
        isLoading={examsQuery.isLoading || assignmentsQuery.isLoading}
      />

      {capabilities.showCommunity ? (
        <CourseCommunityCard
          to={capabilities.communityPath}
          courseTitle={meta.title}
        />
      ) : null}
    </PageMotion>
  );
};
