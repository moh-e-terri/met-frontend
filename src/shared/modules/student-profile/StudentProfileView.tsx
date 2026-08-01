import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatedBar, PageMotion } from "@/shared/motion";
import { StartChatButton } from "@/shared/modules/chats";
import type { StudentProfileDetail, StudentProfileViewerRole } from "./types";

interface StudentProfileViewProps {
  profile: StudentProfileDetail;
  backTo: string;
  backLabel: string;
  chatsPath: string;
  viewerRole: StudentProfileViewerRole;
  courseLinkFor?: (courseId: string) => string | null;
  headerActions?: ReactNode;
  footerSlot?: ReactNode;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("ar-SA");
}

export const StudentProfileView = ({
  profile,
  backTo,
  backLabel,
  chatsPath,
  courseLinkFor,
  headerActions,
  footerSlot,
}: StudentProfileViewProps) => {
  return (
    <PageMotion className="mx-auto w-full max-w-[960px] space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={backTo} className="text-sm font-semibold text-[#64748b] hover:text-[#f5a524]">
            ← {backLabel}
          </Link>
          <h1 className="mt-2 text-2xl font-black text-[#0f172a]">ملف الطالب</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            بيانات الحساب واشتراكات الدورات وكل التفاصيل المرتبطة
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StartChatButton
            userId={profile.userId}
            name={profile.name}
            chatsPath={chatsPath}
            iconOnly={false}
            label="محادثة"
          />
          {headerActions}
        </div>
      </div>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <img
            src={profile.avatar}
            alt=""
            className="size-28 rounded-full border-4 border-[#fff7ed] object-cover"
          />
          <div className="min-w-0 flex-1 text-center sm:text-right">
            <h2 className="text-xl font-bold text-[#0f172a]">{profile.name}</h2>
            <p className="mt-1 text-sm text-[#64748b]" dir="ltr">
              {profile.email || "—"}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {profile.universityName ? (
                <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-[#3b82f6]">
                  {profile.universityName}
                </span>
              ) : null}
              <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#f5a524]">
                {profile.coursesCount} دورة مشتركة
              </span>
              {profile.metPoints != null ? (
                <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#14b8a6]">
                  {profile.metPoints} MET
                </span>
              ) : null}
              <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#64748b]">
                {profile.isActive === false ? "غير نشط" : "نشط"}
              </span>
              {profile.isRecognized ? (
                <span className="rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#14b8a6]">
                  معروف مسبقاً
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#0f172a]">بيانات الحساب</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">الاسم الأول</dt>
              <dd className="font-semibold text-[#0f172a]">{profile.firstName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">الاسم الثاني</dt>
              <dd className="font-semibold text-[#0f172a]">{profile.secondName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">اسم العائلة</dt>
              <dd className="font-semibold text-[#0f172a]">{profile.familyName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">البريد</dt>
              <dd className="font-semibold text-[#0f172a]" dir="ltr">
                {profile.email || "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">الجامعة</dt>
              <dd className="font-semibold text-[#0f172a]">{profile.universityName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">تاريخ الإنشاء</dt>
              <dd className="font-semibold text-[#0f172a]">{formatDate(profile.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#0f172a]">معرّفات النظام</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">معرّف المستخدم</dt>
              <dd className="break-all font-mono text-xs text-[#0f172a]" dir="ltr">
                {profile.userId}
              </dd>
            </div>
            {profile.profileId ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[#64748b]">معرّف ملف الطالب</dt>
                <dd className="break-all font-mono text-xs text-[#0f172a]" dir="ltr">
                  {profile.profileId}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">عدد الدورات</dt>
              <dd className="font-semibold text-[#0f172a]" dir="ltr">
                {profile.coursesCount}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#64748b]">رصيد MET</dt>
              <dd className="font-semibold text-[#0f172a]" dir="ltr">
                {profile.metPoints != null ? `${profile.metPoints} MET` : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-[#0f172a]">اشتراكات الدورات</h3>
          <span className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-semibold text-[#f5a524]">
            {profile.enrollments.length} اشتراك
          </span>
        </div>

        {profile.enrollments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f8fafc] px-4 py-8 text-center text-sm text-[#94a3b8]">
            لا توجد اشتراكات ظاهرة حالياً لهذا الطالب.
          </p>
        ) : (
          <ul className="space-y-3">
            {profile.enrollments.map((course) => {
              const href = courseLinkFor?.(course.courseId) || null;
              const body = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-right">
                      <p className="font-bold text-[#0f172a]">{course.title}</p>
                      <p className="mt-1 text-xs text-[#64748b]">
                        {course.instructorName ? `${course.instructorName} · ` : ""}
                        انضم: {formatDate(course.enrolledAt)}
                        {course.metCost != null ? ` · ${course.metCost} MET` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-bold text-[#3b82f6]" dir="ltr">
                      {course.progress}%
                    </span>
                  </div>
                  <AnimatedBar
                    value={course.progress}
                    className="mt-3 h-2 bg-[#f1f5f9]"
                    barClassName="rounded-full bg-[#f5a524]"
                  />
                </>
              );

              return (
                <li key={course.courseId}>
                  {href ? (
                    <Link
                      to={href}
                      className="block rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4 transition-colors hover:border-[#f5a524]/40 hover:bg-white"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] p-4">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {profile.metTransactions.length > 0 ? (
        <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-bold text-[#0f172a]">سجل نقاط MET</h3>
          <ul className="space-y-2">
            {profile.metTransactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm"
              >
                <div className="min-w-0 text-right">
                  <p className="text-[#475569]">{tx.description}</p>
                  <p className="mt-0.5 text-xs text-[#94a3b8]">{tx.date}</p>
                </div>
                <span
                  className={
                    tx.tone === "success"
                      ? "shrink-0 font-bold text-[#14b8a6]"
                      : "shrink-0 font-bold text-[#f59e0b]"
                  }
                  dir="ltr"
                >
                  {tx.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {footerSlot}
    </PageMotion>
  );
};
