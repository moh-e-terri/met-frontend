import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addStudentMetPoints,
  adminQueryKeys,
  fetchAdminStudentById,
  fetchAdminStudentProfileDetail,
  fetchAdminUniversities,
  updateAdminStudent,
} from "@/admin/api";
import { getAdminBasePath } from "@/core/routing/appSurface";
import { isApiError } from "@/core/api/client";
import {
  StudentAccountEditForm,
  StudentProfileView,
  type StudentAccountEditValues,
} from "@/shared/modules/student-profile";

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]";

export const AdminStudentProfilePage = () => {
  const { studentId = "" } = useParams();
  const basePath = getAdminBasePath();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: adminQueryKeys.studentProfile(studentId),
    queryFn: () => fetchAdminStudentProfileDetail(studentId),
    enabled: Boolean(studentId),
  });

  const studentQuery = useQuery({
    queryKey: [...adminQueryKeys.students({}), "detail", studentId],
    queryFn: () => fetchAdminStudentById(studentId),
    enabled: Boolean(studentId),
  });

  const universitiesQuery = useQuery({
    queryKey: adminQueryKeys.universities(),
    queryFn: () => fetchAdminUniversities(),
  });

  const profile = profileQuery.data;
  const student = studentQuery.data;

  const [metAmount, setMetAmount] = useState("100");
  const [metDescription, setMetDescription] = useState("منحة تعليمية");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const profileDocId = student?.id || profile?.profileId || studentId;

  const invalidateStudent = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "students"] }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.studentProfile(studentId) }),
    ]);
  };

  const updateMutation = useMutation({
    mutationFn: (values: StudentAccountEditValues) =>
      updateAdminStudent(profileDocId, {
        firstName: values.firstName || undefined,
        secondName: values.secondName || undefined,
        familyName: values.familyName || undefined,
        email: values.email || undefined,
        universityId: values.universityId || undefined,
        profileImage: values.profileImage,
      }),
    onSuccess: async () => {
      setFormSuccess("تم حفظ بيانات الطالب.");
      setFormError(null);
      await invalidateStudent();
    },
    onError: (error) => {
      setFormSuccess(null);
      setFormError(isApiError(error) ? error.message : "تعذر حفظ بيانات الطالب");
    },
  });

  const metMutation = useMutation({
    mutationFn: () =>
      addStudentMetPoints(profileDocId, {
        amount: Number(metAmount),
        description: metDescription.trim() || undefined,
      }),
    onSuccess: async () => {
      setFormSuccess("تم إضافة نقاط MET.");
      setFormError(null);
      await invalidateStudent();
    },
    onError: (error) => {
      setFormSuccess(null);
      setFormError(isApiError(error) ? error.message : "تعذر إضافة النقاط");
    },
  });

  const universities = useMemo(
    () => universitiesQuery.data ?? [],
    [universitiesQuery.data],
  );

  if (profileQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-right" dir="rtl">
        <p className="font-bold text-red-600">الطالب غير موجود</p>
        <Link to={`${basePath}/students`} className="mt-3 inline-block text-sm text-[#f5a524]">
          العودة لقائمة الطلاب
        </Link>
      </div>
    );
  }

  return (
    <StudentProfileView
      profile={profile}
      backTo={`${basePath}/students`}
      backLabel="العودة للطلاب"
      chatsPath={`${basePath}/chats`}
      viewerRole="admin"
      courseLinkFor={(courseId) => `${basePath}/courses/${courseId}`}
      footerSlot={
        <div className="space-y-6">
          <StudentAccountEditForm
            initial={{
              firstName: student?.firstName || profile.firstName,
              secondName: student?.secondName || profile.secondName,
              familyName: student?.familyName || profile.familyName,
              email: student?.email || profile.email,
              avatar: profile.avatar,
              universityId: student?.universityId,
            }}
            universities={universities}
            showEmail
            showUniversity
            isSaving={updateMutation.isPending}
            error={formError}
            success={formSuccess}
            onSubmit={(values) => {
              setFormError(null);
              setFormSuccess(null);
              updateMutation.mutate(values);
            }}
          />

          <form
            className="rounded-3xl border border-[#fde8c8] bg-[#fff7ed]/40 p-5 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              const amount = Number(metAmount);
              if (!amount || amount <= 0) return;
              setFormError(null);
              setFormSuccess(null);
              metMutation.mutate();
            }}
          >
            <h3 className="mb-3 text-base font-bold text-[#0f172a]">إضافة نقاط MET</h3>
            <p className="mb-3 text-xs text-[#92400e]">
              مدعوم من الـ API: PATCH /admin/students/:id/met
            </p>
            <input
              type="number"
              min={1}
              value={metAmount}
              onChange={(e) => setMetAmount(e.target.value)}
              className={`${fieldClass} mb-3 bg-white`}
            />
            <input
              value={metDescription}
              onChange={(e) => setMetDescription(e.target.value)}
              placeholder="الوصف"
              className={`${fieldClass} mb-3 bg-white`}
            />
            <button
              type="submit"
              disabled={metMutation.isPending}
              className="w-full rounded-2xl bg-[#f5a524] py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {metMutation.isPending ? "جاري الإضافة..." : "إضافة النقاط"}
            </button>
          </form>
        </div>
      }
    />
  );
};

export default AdminStudentProfilePage;
