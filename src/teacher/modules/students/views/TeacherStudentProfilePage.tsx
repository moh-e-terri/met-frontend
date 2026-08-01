import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { isApiError } from "@/core/api/client";
import {
  fetchTeacherStudentProfile,
  teacherQueryKeys,
  updateTeacherStudent,
} from "@/teacher/api";
import {
  StudentAccountEditForm,
  StudentProfileView,
  type StudentAccountEditValues,
} from "@/shared/modules/student-profile";

export const TeacherStudentProfilePage = () => {
  const { studentUserId = "" } = useParams();
  const basePath = getTeacherBasePath();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: teacherQueryKeys.studentProfile(studentUserId),
    queryFn: () => fetchTeacherStudentProfile(studentUserId),
    enabled: Boolean(studentUserId),
  });

  const profile = profileQuery.data;
  const editId = profile?.profileId || profile?.userId || studentUserId;

  const updateMutation = useMutation({
    mutationFn: (values: StudentAccountEditValues) =>
      updateTeacherStudent(editId, {
        firstName: values.firstName || undefined,
        secondName: values.secondName || undefined,
        familyName: values.familyName || undefined,
        profileImage: values.profileImage,
      }),
    onSuccess: async () => {
      setFormSuccess("تم حفظ بيانات الطالب.");
      setFormError(null);
      await queryClient.invalidateQueries({
        queryKey: teacherQueryKeys.studentProfile(studentUserId),
      });
    },
    onError: (error) => {
      setFormSuccess(null);
      setFormError(
        isApiError(error)
          ? error.message
          : "تعذر حفظ بيانات الطالب من حساب المدرّس",
      );
    },
  });

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
      courseLinkFor={(courseId) => `${basePath}/courses/${courseId}`}
      footerSlot={
        <StudentAccountEditForm
          initial={{
            firstName: profile.firstName,
            secondName: profile.secondName,
            familyName: profile.familyName,
            avatar: profile.avatar,
          }}
          isSaving={updateMutation.isPending}
          error={formError}
          success={formSuccess}
          title="تعديل بيانات الطالب"
          description="عدّل اسم الطالب وصورته. إن ظهر خطأ 404 فالمطلوب من الـ Backend: PATCH /instructor/students/:id"
          onSubmit={(values) => {
            setFormError(null);
            setFormSuccess(null);
            updateMutation.mutate(values);
          }}
        />
      }
    />
  );
};

export default TeacherStudentProfilePage;
