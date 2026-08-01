import { useState } from "react";
import { changePassword } from "@/core/auth/authService";
import { PasswordInput } from "./PasswordInput";

interface ChangePasswordCardProps {
  className?: string;
}

export const ChangePasswordCard = ({ className }: ChangePasswordCardProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccess("تم تغيير كلمة المرور بنجاح.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "تعذر تغيير كلمة المرور. تحقق من كلمة المرور الحالية.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 ${className ?? ""}`}
      dir="rtl"
    >
      <div className="mb-6 text-right">
        <h2 className="text-lg font-bold text-[#0f172a]">تغيير كلمة المرور</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          استخدم كلمة مرور قوية لا تُشاركها مع أي شخص.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <PasswordInput
          label="كلمة المرور الحالية"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          autoComplete="current-password"
        />
        <PasswordInput
          label="كلمة المرور الجديدة"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          autoComplete="new-password"
        />
        <PasswordInput
          label="تأكيد كلمة المرور الجديدة"
          value={confirmNewPassword}
          onChange={(event) => setConfirmNewPassword(event.target.value)}
          required
          autoComplete="new-password"
        />

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3 text-sm text-[#14b8a6]">
            {success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[#f5a524] px-6 py-3 text-sm font-bold text-white shadow-[0px_8px_16px_-4px_rgba(245,165,36,0.35)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "جاري الحفظ..." : "تحديث كلمة المرور"}
        </button>
      </form>
    </section>
  );
};
