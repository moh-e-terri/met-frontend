import { useAuth } from "@/core/auth/AuthContext";
import { PageMotion } from "@/shared/motion";
import { ChangePasswordCard } from "@/shared/components/ChangePasswordCard";
import { ProfileSettingsCard } from "./ProfileSettingsCard";

interface AccountSettingsPageProps {
  title?: string;
  subtitle?: string;
}

export const AccountSettingsPage = ({
  title = "إعدادات الحساب",
  subtitle = "إدارة بياناتك الشخصية وأمان حسابك",
}: AccountSettingsPageProps) => {
  const { session } = useAuth();

  return (
    <PageMotion className="mx-auto w-full max-w-[720px] space-y-6">
      <header className="text-right" dir="rtl">
        <h1 className="text-2xl font-black text-[#0f172a]">{title}</h1>
        <p className="mt-2 text-sm text-[#64748b]">{subtitle}</p>
        {session?.role === "teacher" ? (
          <p className="mt-1 text-xs text-[#14b8a6]">
            يمكنك تعديل الاسم والجوال والنبذة والصورة الشخصية من هنا.
          </p>
        ) : null}
      </header>

      <ProfileSettingsCard />
      <ChangePasswordCard />
    </PageMotion>
  );
};

export default AccountSettingsPage;
