import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminQueryKeys,
  fetchAdminInstructorById,
  updateAdminInstructor,
} from "@/admin/api";
import { getAdminBasePath } from "@/core/routing/appSurface";
import { isApiError } from "@/core/api/client";
import { PageMotion } from "@/shared/motion";
import { StartChatButton } from "@/shared/modules/chats";

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]";

export const AdminLecturerProfilePage = () => {
  const { lecturerId = "" } = useParams();
  const basePath = getAdminBasePath();
  const queryClient = useQueryClient();

  const lecturerQuery = useQuery({
    queryKey: [...adminQueryKeys.instructors({}), "detail", lecturerId],
    queryFn: () => fetchAdminInstructorById(lecturerId),
    enabled: Boolean(lecturerId),
  });

  const lecturer = lecturerQuery.data;

  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [paypalAccount, setPaypalAccount] = useState("");
  const [bio, setBio] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!lecturer) return;
    setFirstName(lecturer.firstName || lecturer.name.split(/\s+/)[0] || "");
    setSecondName(lecturer.secondName || "");
    setFamilyName(lecturer.familyName || lecturer.name.split(/\s+/).slice(-1)[0] || "");
    setEmail(lecturer.email || "");
    setPhoneNumber(lecturer.phoneNumber || "");
    setDateOfBirth(lecturer.dateOfBirth ? lecturer.dateOfBirth.slice(0, 10) : "");
    setPaypalAccount(lecturer.paypalAccount || "");
    setBio(lecturer.bio || "");
    setFormError(null);
    setFormSuccess(null);
  }, [lecturer]);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateAdminInstructor(lecturerId, {
        firstName: firstName.trim() || undefined,
        secondName: secondName.trim() || undefined,
        familyName: familyName.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        paypalAccount: paypalAccount.trim() || undefined,
        bio: bio.trim() || undefined,
      }),
    onSuccess: async () => {
      setFormSuccess("تم حفظ بيانات المدرّس.");
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] });
    },
    onError: (error) => {
      setFormSuccess(null);
      setFormError(
        isApiError(error)
          ? error.message
          : "تعذر حفظ بيانات المدرّس. يلزم PATCH /admin/instructors/:id من الـ Backend.",
      );
    },
  });

  if (lecturerQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  if (!lecturer) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-right" dir="rtl">
        <p className="font-bold text-red-600">المدرّس غير موجود</p>
        <Link to={`${basePath}/lecturers`} className="mt-3 inline-block text-sm text-[#f5a524]">
          العودة لقائمة المحاضرين
        </Link>
      </div>
    );
  }

  return (
    <PageMotion className="mx-auto w-full max-w-[960px] space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to={`${basePath}/lecturers`}
            className="text-sm font-semibold text-[#64748b] hover:text-[#f5a524]"
          >
            ← العودة للمحاضرين
          </Link>
          <h1 className="mt-2 text-2xl font-black text-[#0f172a]">ملف المدرّس</h1>
          <p className="mt-1 text-sm text-[#64748b]">كل البيانات القادمة من قاعدة البيانات</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StartChatButton
            userId={lecturer.userId || lecturer.id}
            name={lecturer.name}
            chatsPath={`${basePath}/chats`}
            iconOnly={false}
            label="محادثة"
          />
          <Link
            to={`${basePath}/financials?instructorId=${encodeURIComponent(lecturer.id)}&userId=${encodeURIComponent(lecturer.userId)}`}
            className="rounded-2xl bg-[#f5a524] px-4 py-2.5 text-sm font-bold text-white"
          >
            الشؤون المالية
          </Link>
        </div>
      </div>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-4 border-b border-[#f1f5f9] pb-6 sm:flex-row sm:items-start">
          <img
            src={lecturer.avatar}
            alt=""
            className="size-28 rounded-full border-4 border-[#fff7ed] object-cover"
          />
          <div className="min-w-0 flex-1 text-center sm:text-right">
            <h2 className="text-xl font-bold text-[#0f172a]">{lecturer.name}</h2>
            {lecturer.email ? (
              <p className="mt-1 text-sm text-[#64748b]" dir="ltr">
                {lecturer.email}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#f5a524]">
                {lecturer.coursesCount} دورات
              </span>
              <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#3b82f6]">
                {lecturer.studentsCount} طالب
              </span>
              <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#14b8a6]">
                {lecturer.isActive === false ? "غير نشط" : "نشط"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#d1fae5] bg-[#ecfdf5]/60 px-4 py-3 text-sm text-[#065f46]">
          يمكنك تعديل بيانات المدرّس مباشرة — تُحفظ عبر PATCH /admin/instructors/:id.
        </div>

        {(formError || formSuccess) && (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              formError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {formError || formSuccess}
          </p>
        )}

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setFormError(null);
            setFormSuccess(null);
            updateMutation.mutate();
          }}
        >
          <label className="block text-right text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">الاسم الأول</span>
            <input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="block text-right text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">الاسم الثاني</span>
            <input className={fieldClass} value={secondName} onChange={(e) => setSecondName(e.target.value)} />
          </label>
          <label className="block text-right text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">اسم العائلة</span>
            <input className={fieldClass} value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          </label>
          <label className="block text-right text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">البريد</span>
            <input
              className={fieldClass}
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-right text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">رقم الجوال</span>
            <input
              className={fieldClass}
              dir="ltr"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </label>
          <label className="block text-right text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">تاريخ الميلاد</span>
            <input
              type="date"
              className={fieldClass}
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </label>
          <label className="block text-right text-sm sm:col-span-2">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">حساب PayPal</span>
            <input
              className={fieldClass}
              dir="ltr"
              value={paypalAccount}
              onChange={(e) => setPaypalAccount(e.target.value)}
            />
          </label>
          <label className="block text-right text-sm sm:col-span-2">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">نبذة</span>
            <textarea
              className="min-h-[100px] w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-2xl bg-[#f5a524] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 text-center shadow-sm">
          <p className="text-xs text-[#64748b]">إجمالي المكتسب</p>
          <p className="mt-2 text-xl font-black text-[#0f172a]" dir="ltr">
            {lecturer.totalProfit}
          </p>
        </div>
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 text-center shadow-sm">
          <p className="text-xs text-[#64748b]">المصروف</p>
          <p className="mt-2 text-xl font-black text-[#14b8a6]" dir="ltr">
            {lecturer.availableBalance}
          </p>
        </div>
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 text-center shadow-sm">
          <p className="text-xs text-[#64748b]">المحجوز</p>
          <p className="mt-2 text-xl font-black text-[#f59e0b]" dir="ltr">
            {lecturer.pendingBalance}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-[#0f172a]">الدورات المسندة</h3>
        {lecturer.managedCourses.length === 0 ? (
          <p className="text-sm text-[#94a3b8]">لا توجد دورات مسندة حالياً.</p>
        ) : (
          <ul className="space-y-2">
            {lecturer.managedCourses.map((course) => (
              <li
                key={course.id || course.name}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#0f172a]">{course.name}</p>
                  {course.metCost != null ? (
                    <p className="mt-0.5 text-xs text-[#64748b]" dir="ltr">
                      {course.metCost} MET
                    </p>
                  ) : null}
                </div>
                <span className="text-xs font-semibold text-[#64748b]" dir="ltr">
                  {course.enrolledCount != null
                    ? `${course.enrolledCount} طالب`
                    : course.revenue}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-[#0f172a]">معرّفات النظام</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-[#64748b]">معرّف المدرّس</dt>
            <dd className="font-mono text-xs text-[#0f172a]" dir="ltr">
              {lecturer.id}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#64748b]">معرّف المستخدم</dt>
            <dd className="font-mono text-xs text-[#0f172a]" dir="ltr">
              {lecturer.userId}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[#64748b]">تاريخ الانضمام</dt>
            <dd className="text-[#0f172a]">{lecturer.joinedDate}</dd>
          </div>
        </dl>
      </section>
    </PageMotion>
  );
};

export default AdminLecturerProfilePage;
