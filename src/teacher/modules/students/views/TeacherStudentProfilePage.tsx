import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { fetchTeacherStudentProfile, teacherQueryKeys } from "@/teacher/api";
import { StudentProfileView } from "@/shared/modules/student-profile";

export const TeacherStudentProfilePage = () => {
  const { studentUserId = "" } = useParams();
  const basePath = getTeacherBasePath();

  const profileQuery = useQuery({
    queryKey: teacherQueryKeys.studentProfile(studentUserId),
    queryFn: () => fetchTeacherStudentProfile(studentUserId),
    enabled: Boolean(studentUserId),
  });

  const profile = profileQuery.data;

  if (profileQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-right" dir="rtl">
        <p className="font-bold text-red-600">لم يُعثر على هذا الطالب ضمن دوراتك.</p>
        <p className="mt-2 text-sm text-red-500">
          يظهر الملف فقط للطلاب المسجّلين في مقرراتك.
        </p>
        <Link to={basePath} className="mt-3 inline-block text-sm text-[#f5a524]">
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <StudentProfileView
      profile={profile}
      backTo={basePath}
      backLabel="العودة للوحة التحكم"
      chatsPath={`${basePath}/chats`}
      viewerRole="teacher"
      detailLevel="basic"
      courseLinkFor={(courseId) => `${basePath}/courses/${courseId}`}
    />
  );
};

export default TeacherStudentProfilePage;
