import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageMotion } from "@/shared/motion";
import { AppModal } from "@/shared/components/AppModal";
import {
  adminQueryKeys,
  createAdminInstructor,
  fetchAdminInstructorFinance,
  fetchAdminInstructors,
} from "@/admin/api";
import type { AdminLecturer } from "../data/mockAdminLecturers";
import { AdminLecturerProfilePanel } from "../components/AdminLecturerProfilePanel";
import { AdminLecturersPageHeader } from "../components/AdminLecturersPageHeader";
import { AdminLecturersStatsCards } from "../components/AdminLecturersStatsCards";
import { AdminLecturersTable } from "../components/AdminLecturersTable";

const LECTURERS_PAGE_SIZE = 10;

function formatMet(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${value.toLocaleString("en-US")} MET`;
}

function enrichLecturerWithFinance(
  lecturer: AdminLecturer,
  financeRows: Array<{
    instructorId: string;
    email?: string;
    totalEarnedMET: number;
    totalReservedMET: number;
    totalReleasedMET: number;
    courses: Array<{
      courseId: string;
      title: string;
      enrolledCount: number;
      earnedMET: number;
      reservedMET: number;
    }>;
  }>,
): AdminLecturer {
  const finance = financeRows.find(
    (row) =>
      row.instructorId === lecturer.id ||
      row.instructorId === lecturer.userId ||
      (lecturer.email &&
        row.email?.toLowerCase() === lecturer.email.toLowerCase()),
  );
  if (!finance) return lecturer;

  const financeCourses = finance.courses.map((course) => ({
    id: course.courseId,
    name: course.title,
    enrolledCount: course.enrolledCount,
    revenue:
      course.enrolledCount > 0
        ? `${course.enrolledCount.toLocaleString("en-US")} طالب`
        : course.earnedMET > 0
          ? `${course.earnedMET.toLocaleString("en-US")} MET`
          : "—",
  }));

  const studentsFromFinance = finance.courses.reduce(
    (sum, course) => sum + course.enrolledCount,
    0,
  );
  const studentsFromManaged = lecturer.managedCourses.reduce(
    (sum, course) => sum + (course.enrolledCount ?? 0),
    0,
  );

  return {
    ...lecturer,
    coursesCount: Math.max(lecturer.coursesCount, finance.courses.length),
    studentsCount: String(Math.max(studentsFromFinance, studentsFromManaged, Number(lecturer.studentsCount) || 0)),
    managedCourses:
      lecturer.managedCourses.length > 0 ? lecturer.managedCourses : financeCourses,
    earnings: formatMet(finance.totalEarnedMET),
    totalProfit: formatMet(finance.totalEarnedMET),
    availableBalance: formatMet(finance.totalReleasedMET),
    pendingBalance: formatMet(finance.totalReservedMET),
  };
}

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]";

export const AdminLecturersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [paypalAccount, setPaypalAccount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const lecturersQuery = useQuery({
    queryKey: adminQueryKeys.instructors({ page, limit: LECTURERS_PAGE_SIZE }),
    queryFn: () => fetchAdminInstructors({ page, limit: LECTURERS_PAGE_SIZE }),
  });

  const financeQuery = useQuery({
    queryKey: adminQueryKeys.financePayments({ page: 1, limit: 100 }),
    queryFn: () => fetchAdminInstructorFinance({ page: 1, limit: 100 }),
  });

  const lecturers = useMemo(() => {
    const items = lecturersQuery.data?.items ?? [];
    const financeRows = financeQuery.data?.items ?? [];
    if (financeRows.length === 0) return items;
    return items.map((lecturer) => enrichLecturerWithFinance(lecturer, financeRows));
  }, [lecturersQuery.data?.items, financeQuery.data?.items]);

  const pagination = lecturersQuery.data?.pagination;
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!selectedId && lecturers.length > 0) {
      setSelectedId(lecturers[0].id);
    }
  }, [lecturers, selectedId]);

  const resetForm = () => {
    setFirstName("");
    setSecondName("");
    setFamilyName("");
    setEmail("");
    setPassword("");
    setNationalId("");
    setPaypalAccount("");
    setFormError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminInstructor({
        firstName: firstName.trim(),
        secondName: secondName.trim(),
        familyName: familyName.trim(),
        email: email.trim(),
        password,
        nationalId: nationalId.trim(),
        paypalAccount: paypalAccount.trim() || undefined,
      }),
    onSuccess: async (created) => {
      closeForm();

      if (created) {
        queryClient.setQueryData<{
          items: AdminLecturer[];
          pagination: NonNullable<typeof pagination>;
        }>(
          adminQueryKeys.instructors({ page, limit: LECTURERS_PAGE_SIZE }),
          (current) => {
            const items = current?.items ?? [];
            const exists = items.some((lecturer) => lecturer.id === created.id);
            return {
              items: exists ? items : [created, ...items],
              pagination: current?.pagination ?? {
                total: items.length + 1,
                page: 1,
                limit: LECTURERS_PAGE_SIZE,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            };
          },
        );
        setSelectedId(created.id);
        setPage(1);
      }

      await queryClient.refetchQueries({ queryKey: ["admin", "instructors"] });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "تعذر إضافة المدرس");
    },
  });

  const activeLecturer =
    lecturers.find((lecturer) => lecturer.id === selectedId) ?? lecturers[0];

  // No activate/deactivate API yet — treat all instructors as active (= total).
  const totalInstructors = pagination?.total ?? lecturers.length;
  const totalCourses = lecturers.reduce((sum, lecturer) => sum + lecturer.coursesCount, 0);

  const lecturerStats = [
    {
      label: "إجمالي المحاضرين",
      value: String(totalInstructors),
      icon: "/images/student/icon-active-user.svg",
      iconBg: "bg-[#eff6ff]",
      iconColor: "text-[#3b82f6]",
    },
    {
      label: "محاضرون نشطون",
      value: String(totalInstructors),
      icon: "/images/student/icon-groups.svg",
      iconBg: "bg-[#ecfdf5]",
      iconColor: "text-[#14b8a6]",
    },
    {
      label: "إجمالي المقررات المُدارة",
      value: String(totalCourses),
      icon: "/images/student/icon-book.svg",
      iconBg: "bg-[#fff7ed]",
      iconColor: "text-[#f5a524]",
    },
    {
      label: "متوسط المقررات/محاضر",
      value: lecturers.length ? String(Math.round(totalCourses / lecturers.length)) : "0",
      showStars: true,
      icon: "/images/student/icon-star.svg",
      iconBg: "bg-[#f5f3ff]",
      iconColor: "text-[#8b5cf6]",
    },
  ];

  return (
    <PageMotion className="mx-auto w-full max-w-[1280px] space-y-6">
      <AdminLecturersPageHeader onAddInstructor={() => setShowForm(true)} />

      {lecturersQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-right text-sm text-red-600">
          {lecturersQuery.error instanceof Error
            ? lecturersQuery.error.message
            : "تعذر تحميل قائمة المدرسين"}
        </div>
      ) : null}

      <AdminLecturersStatsCards
        stats={lecturerStats}
        isLoading={lecturersQuery.isLoading}
      />

      <section
        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"
        dir="ltr"
      >
        <aside className="order-2 xl:order-1 xl:row-start-1">
          {activeLecturer ? <AdminLecturerProfilePanel lecturer={activeLecturer} /> : null}
        </aside>

        <div className="order-1 min-w-0 xl:order-2 xl:row-start-1">
          <AdminLecturersTable
            lecturers={lecturers}
            selectedId={activeLecturer?.id ?? ""}
            onSelect={(lecturer) => setSelectedId(lecturer.id)}
            isLoading={lecturersQuery.isLoading}
            pagination={pagination}
            onPageChange={setPage}
            isFetching={lecturersQuery.isFetching}
          />
        </div>
      </section>

      <AppModal
        open={showForm}
        onClose={() => {
          if (createMutation.isPending) return;
          closeForm();
        }}
        title="إضافة مدرس"
        description="أدخل بيانات المحاضر لإنشاء حساب جديد."
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeForm}
              disabled={createMutation.isPending}
              className="rounded-2xl border border-[#e2e8f0] bg-white px-5 py-2.5 text-sm font-bold text-[#64748b]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              form="admin-create-lecturer-form"
              disabled={createMutation.isPending}
              className="rounded-2xl bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            >
              {createMutation.isPending ? "جاري الحفظ..." : "حفظ المدرس"}
            </button>
          </div>
        }
      >
        <form
          id="admin-create-lecturer-form"
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="الاسم الأول"
            required
            className={fieldClass}
          />
          <input
            value={secondName}
            onChange={(event) => setSecondName(event.target.value)}
            placeholder="الاسم الثاني"
            required
            className={fieldClass}
          />
          <input
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            placeholder="اسم العائلة"
            required
            className={fieldClass}
          />
          <input
            value={nationalId}
            onChange={(event) => setNationalId(event.target.value)}
            placeholder="رقم الهوية"
            required
            className={fieldClass}
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="البريد الإلكتروني"
            required
            className={fieldClass}
            dir="ltr"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="كلمة المرور"
            required
            className={fieldClass}
            dir="ltr"
          />
          <input
            value={paypalAccount}
            onChange={(event) => setPaypalAccount(event.target.value)}
            placeholder="حساب PayPal (اختياري)"
            className={`${fieldClass} sm:col-span-2`}
            dir="ltr"
          />
          {formError ? (
            <p className="text-sm text-red-500 sm:col-span-2">{formError}</p>
          ) : null}
        </form>
      </AppModal>
    </PageMotion>
  );
};
