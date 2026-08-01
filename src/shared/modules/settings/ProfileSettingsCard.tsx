import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import { isApiError } from "@/core/api/client";
import {
  fetchOwnProfile,
  fileToDataUrl,
  updateOwnProfile,
  type OwnProfile,
} from "@/core/api/profile";

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]";

function defaultAvatar(role: string | undefined) {
  if (role === "admin") return "/images/admin/avatar-admin.svg";
  if (role === "teacher") return "/images/teacher/avatar-teacher-default.svg";
  return "/images/student/avatar-student-default.svg";
}

export const ProfileSettingsCard = () => {
  const { session, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["own-profile", session?.userId, session?.role],
    queryFn: () => fetchOwnProfile(session!.role),
    enabled: Boolean(session?.userId && session?.role),
  });

  const profile = profileQuery.data;

  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [paypalAccount, setPaypalAccount] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName || "");
    setSecondName(profile.secondName || "");
    setFamilyName(profile.familyName || "");
    setPhoneNumber(profile.phoneNumber || "");
    setBio(profile.bio || "");
    setPaypalAccount(profile.paypalAccount || "");
    setAvatarPreview(null);
    setPendingAvatar(null);
    setError(null);
    setSuccess(null);
  }, [profile]);

  const applySessionFromProfile = async (next: OwnProfile) => {
    await refreshSession();
    // Ensure UI immediately reflects avatar even if /auth/me is slow/cached oddly.
    await queryClient.invalidateQueries({
      queryKey: ["own-profile", session?.userId, session?.role],
    });
    return next;
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      updateOwnProfile(session!.role, {
        firstName: firstName.trim(),
        secondName: secondName.trim(),
        familyName: familyName.trim(),
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
        paypalAccount: paypalAccount.trim(),
        profileImage: pendingAvatar === null ? undefined : pendingAvatar,
      }),
    onSuccess: async (next) => {
      setSuccess("تم حفظ بيانات الملف الشخصي.");
      setError(null);
      setPendingAvatar(null);
      setAvatarPreview(null);
      await applySessionFromProfile(next);
    },
    onError: (err) => {
      setSuccess(null);
      setError(isApiError(err) ? err.message : "تعذر حفظ الملف الشخصي");
    },
  });

  const displayAvatar =
    avatarPreview || profile?.avatar || session?.avatar || defaultAvatar(session?.role);

  const editable = Boolean(profile?.canEdit);
  const canEditAvatar = Boolean(profile?.canEditAvatar);

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6"
      dir="rtl"
    >
      <div className="mb-5 text-right">
        <h2 className="text-lg font-bold text-[#0f172a]">الملف الشخصي</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          {editable
            ? "عدّل بياناتك وصورتك — تُحفظ مباشرة في قاعدة البيانات."
            : "عرض بيانات حسابك. تعديل الاسم/الصورة غير متاح لهذا الدور من الـ Backend حالياً."}
        </p>
      </div>

      {profileQuery.isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-[#f1f5f9]" />
      ) : profileQuery.isError ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {profileQuery.error instanceof Error
            ? profileQuery.error.message
            : "تعذر تحميل الملف الشخصي"}
        </p>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (!editable) return;
            setError(null);
            setSuccess(null);
            saveMutation.mutate();
          }}
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
              <img
                src={displayAvatar}
                alt=""
                className="size-24 rounded-full border-4 border-[#fff7ed] object-cover"
              />
              {canEditAvatar ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 left-1 rounded-full bg-[#f5a524] px-2.5 py-1 text-[10px] font-bold text-white shadow"
                >
                  تغيير
                </button>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    const dataUrl = await fileToDataUrl(file);
                    setAvatarPreview(dataUrl);
                    setPendingAvatar(dataUrl);
                    setError(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "تعذر قراءة الصورة");
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-right">
              <p className="font-bold text-[#0f172a]">
                {profile?.fullName || session?.name}
              </p>
              <p className="mt-1 text-sm text-[#64748b]" dir="ltr">
                {profile?.email || session?.email}
              </p>
              {profile?.universityName ? (
                <p className="mt-1 text-xs text-[#94a3b8]">{profile.universityName}</p>
              ) : null}
              {canEditAvatar ? (
                <p className="mt-2 text-xs text-[#94a3b8]">
                  JPG/PNG حتى 1.5MB — تُحفظ مع زر الحفظ أدناه
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-[#0f172a]">الاسم الأول</span>
              <input
                className={fieldClass}
                value={firstName}
                disabled={!editable}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-[#0f172a]">الاسم الثاني</span>
              <input
                className={fieldClass}
                value={secondName}
                disabled={!editable}
                onChange={(e) => setSecondName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-[#0f172a]">اسم العائلة</span>
              <input
                className={fieldClass}
                value={familyName}
                disabled={!editable}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-[#0f172a]">البريد</span>
              <input
                className={fieldClass}
                dir="ltr"
                value={profile?.email || ""}
                disabled
              />
            </label>

            {session?.role === "teacher" ? (
              <>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-[#0f172a]">رقم الجوال</span>
                  <input
                    className={fieldClass}
                    dir="ltr"
                    value={phoneNumber}
                    disabled={!editable}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-[#0f172a]">PayPal</span>
                  <input
                    className={fieldClass}
                    dir="ltr"
                    value={paypalAccount}
                    disabled={!editable}
                    onChange={(e) => setPaypalAccount(e.target.value)}
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-semibold text-[#0f172a]">نبذة</span>
                  <textarea
                    className="min-h-[96px] w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-sm outline-none focus:border-[#f5a524] disabled:opacity-70"
                    value={bio}
                    disabled={!editable}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </label>
              </>
            ) : null}
          </div>

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

          {editable ? (
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-2xl bg-[#f5a524] px-6 py-3 text-sm font-bold text-white shadow-[0px_8px_16px_-4px_rgba(245,165,36,0.35)] disabled:opacity-60"
            >
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ الملف الشخصي"}
            </button>
          ) : null}
        </form>
      )}
    </section>
  );
};
