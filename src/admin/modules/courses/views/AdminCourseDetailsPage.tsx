import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  adminQueryKeys,
  fetchAdminCourseById,
} from "@/admin/api";
import {
  courseLevelLabels,
  courseStatusLabels,
} from "../data/mockAdminCourses";
import {
  capabilitiesForRole,
  CourseWorkspace,
  type CourseWorkspaceMeta,
} from "@/shared/modules/course-workspace";

export const AdminCourseDetailsPage = () => {
  const { courseId = "" } = useParams<{ courseId: string }>();

  const courseQuery = useQuery({
    queryKey: [...adminQueryKeys.courses({}), "detail", courseId],
    queryFn: () => fetchAdminCourseById(courseId),
    enabled: Boolean(courseId),
  });

  const course = courseQuery.data;

  if (courseQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1280px] space-y-6">
        <div className="h-40 animate-pulse rounded-3xl bg-[#e2e8f0]" />
        <div className="h-[420px] animate-pulse rounded-3xl bg-[#e2e8f0]" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-[720px] rounded-3xl border border-red-200 bg-red-50 p-6 text-right">
        <p className="font-bold text-red-700">المقرر غير موجود</p>
        <Link to="/admin/courses" className="mt-3 inline-flex text-sm font-semibold text-[#3b82f6]">
          العودة لكتالوج المقررات
        </Link>
      </div>
    );
  }

  const status = courseStatusLabels[course.status];
  const meta: CourseWorkspaceMeta = {
    id: course.id,
    title: course.title,
    description: course.description,
    image: course.image,
    level: course.level ? courseLevelLabels[course.level] : course.category,
    statusLabel: status.label,
    statusClassName: status.className,
    university: course.university,
    metCost: course.metCost,
    enrolledCount: course.enrolledCount,
    lecturerName: course.lecturer,
    lecturerAvatar: course.lecturerAvatar,
    lecturerId: course.lecturerUserId || course.instructorId,
  };

  return (
    <CourseWorkspace
      meta={meta}
      capabilities={capabilitiesForRole("admin", course.id)}
      backLink={
        <div className="flex flex-wrap items-center justify-between gap-3" dir="rtl">
          <Link
            to="/admin/courses"
            className="text-sm font-semibold text-[#64748b] hover:text-[#0f172a]"
          >
            ← العودة إلى كتالوج المقررات
          </Link>
          <Link
            to={`/admin/courses?edit=${course.id}`}
            className="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-bold text-[#0f172a]"
          >
            تعديل البيانات
          </Link>
        </div>
      }
    />
  );
};
