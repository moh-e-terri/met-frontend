import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import { ChangePasswordCard } from "@/shared/components/ChangePasswordCard";

interface AccountSettingsPageProps {
  title?: string;
  subtitle?: string;
}

export const AccountSettingsPage = ({
  title = "إعدادات الحساب",
  subtitle = "إدارة بيانات الدخول وأمان حسابك",
}: AccountSettingsPageProps) => {
  const { session } = useAuth();

  return (
    <PageMotion className="mx-auto w-full max-w-[720px] space-y-6">
      <header className="text-right" dir="rtl">
        <h1 className="text-2xl font-black text-[#0f172a]">{title}</h1>
        <p className="mt-2 text-sm text-[#64748b]">{subtitle}</p>
      </header>

      <section
        className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
        dir="rtl"
      >
        <h2 className="mb-4 text-lg font-bold text-[#0f172a]">معلومات الحساب</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3">
            <dt className="text-xs font-medium text-[#94a3b8]">الاسم</dt>
            <dd className="mt-1 text-sm font-semibold text-[#0f172a]">
              {session?.name ?? "—"}
            </dd>
          </div>
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3">
            <dt className="text-xs font-medium text-[#94a3b8]">البريد الإلكتروني</dt>
            <dd className="mt-1 text-sm font-semibold text-[#0f172a]" dir="ltr">
              {session?.email ?? "—"}
            </dd>
          </div>
          <div className="rounded-2xl bg-[#f8fafc] px-4 py-3">
            <dt className="text-xs font-medium text-[#94a3b8]">الدور</dt>
            <dd className="mt-1 text-sm font-semibold text-[#0f172a]">
              {session?.role === "admin"
                ? "مدير النظام"
                : session?.role === "teacher"
                  ? "مدرّس"
                  : "طالب"}
            </dd>
          </div>
          {session?.universityName ? (
            <div className="rounded-2xl bg-[#f8fafc] px-4 py-3">
              <dt className="text-xs font-medium text-[#94a3b8]">الجامعة</dt>
              <dd className="mt-1 text-sm font-semibold text-[#0f172a]">
                {session.universityName}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <ChangePasswordCard />
    </PageMotion>
  );
};
