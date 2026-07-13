import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { fetchCourseLessons, lessonQueryKeys } from "@/core/api/lessons";
import { courseStudentsQueryKeys, fetchCourseStudents, fetchInstructorDashboard, teacherQueryKeys } from "@/teacher/api";
import {
  CourseCurriculumSection,
  mapToCurriculumLessons,
} from "../components/CourseCurriculumSection";
import { CourseAssignmentsSection } from "../components/CourseAssignmentsSection";
import { CourseExamsSection } from "../components/CourseExamsSection";
import { CourseDetailsForm } from "../components/CourseDetailsForm";
import { CourseEditorSidebar } from "../components/CourseEditorSidebar";
import { CourseStudentsSection } from "../components/CourseStudentsSection";

export const TeacherCourseEditorPage = () => {
  const { courseId = "new" } = useParams<{ courseId: string }>();
  const isExistingCourse = courseId !== "new";

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

  const assignedCourse = dashboardQuery.data?.courses.find((course) => course.id === courseId);
  const lessons = isExistingCourse ? mapToCurriculumLessons(lessonsQuery.data ?? []) : [];

  const form = {
    title: assignedCourse?.title ?? "",
    description: "يتم إدارة بيانات المقرر الأساسية من لوحة الإدارة.",
    category: "برمجة",
    level: "intermediate" as const,
    price: "—",
    tags: "",
  };

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px]">
      <div
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          <CourseEditorSidebar courses={dashboardQuery.data?.courses ?? []} />
        </aside>

        <div className="order-1 min-w-0 space-y-6 xl:order-2 xl:row-start-1">
          {!isExistingCourse ? (
            <section
              className="rounded-3xl border border-[#fde8c8] bg-[#fff7ed] px-5 py-6 text-right shadow-sm"
              dir="rtl"
            >
              <h2 className="text-lg font-bold text-[#0f172a]">إنشاء مقرر جديد</h2>
              <p className="mt-2 text-sm leading-7 text-[#64748b]">
                يتم إنشاء المقررات وإسنادها للمدرّسين من لوحة الإدارة. بعد الإسناد ستظهر
                المقررات هنا ويمكنك إضافة الدروس والواجبات والاختبارات.
              </p>
              <Link
                to="/teacher"
                className="mt-4 inline-flex rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white"
              >
                العودة للوحة التحكم
              </Link>
            </section>
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
              <CourseDetailsForm form={form} readOnly />
              <CourseStudentsSection
                students={studentsQuery.data ?? []}
                isLoading={studentsQuery.isLoading}
              />

              {lessonsQuery.isLoading ? (
                <div className="h-48 animate-pulse rounded-3xl bg-[#e2e8f0]" />
              ) : (
                <CourseCurriculumSection courseId={courseId} lessons={lessons} />
              )}

              <CourseAssignmentsSection courseId={courseId} />
              <CourseExamsSection courseId={courseId} />
            </>
          ) : null}
        </div>
      </div>
    </PageMotion>
  );
};
