import { useEffect, useRef, useState } from "react";
import { fileToDataUrl } from "@/core/api/profile";

const fieldClass =
  "h-11 w-full rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm outline-none focus:border-[#f5a524]";

export interface StudentAccountEditValues {
  firstName: string;
  secondName: string;
  familyName: string;
  email?: string;
  universityId?: string;
  profileImage?: string | null;
}

export interface StudentAccountEditFormProps {
  initial: {
    firstName?: string;
    secondName?: string;
    familyName?: string;
    email?: string;
    avatar?: string;
    universityId?: string;
  };
  universities?: { id: string; name: string }[];
  showEmail?: boolean;
  showUniversity?: boolean;
  isSaving?: boolean;
  error?: string | null;
  success?: string | null;
  onSubmit: (values: StudentAccountEditValues) => void | Promise<void>;
  title?: string;
  description?: string;
}

export const StudentAccountEditForm = ({
  initial,
  universities = [],
  showEmail = false,
  showUniversity = false,
  isSaving = false,
  error,
  success,
  onSubmit,
  title = "تعديل بيانات الطالب",
  description = "عدّل الاسم والصورة — تُحفظ مباشرة في قاعدة البيانات.",
}: StudentAccountEditFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(initial.firstName || "");
    setSecondName(initial.secondName || "");
    setFamilyName(initial.familyName || "");
    setEmail(initial.email === "—" ? "" : initial.email || "");
    setUniversityId(initial.universityId || "");
    setAvatarPreview(null);
    setPendingAvatar(null);
    setLocalError(null);
  }, [
    initial.firstName,
    initial.secondName,
    initial.familyName,
    initial.email,
    initial.universityId,
    initial.avatar,
  ]);

  const displayAvatar = avatarPreview || initial.avatar || "/images/student/avatar-student-default.svg";

  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6" dir="rtl">
      <h3 className="mb-1 text-base font-bold text-[#0f172a]">{title}</h3>
      <p className="mb-4 text-sm text-[#64748b]">{description}</p>

      {(localError || error || success) && (
        <p
          className={`mb-4 rounded-2xl px-4 py-3 text-sm ${
            localError || error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {localError || error || success}
        </p>
      )}

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            firstName: firstName.trim(),
            secondName: secondName.trim(),
            familyName: familyName.trim(),
            email: showEmail ? email.trim() : undefined,
            universityId: showUniversity ? universityId || undefined : undefined,
            profileImage: pendingAvatar === null ? undefined : pendingAvatar,
          });
        }}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <img
              src={displayAvatar}
              alt=""
              className="size-24 rounded-full border-4 border-[#fff7ed] object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 left-1 rounded-full bg-[#f5a524] px-2.5 py-1 text-[10px] font-bold text-white shadow"
            >
              تغيير
            </button>
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
                  setLocalError(null);
                } catch (err) {
                  setLocalError(err instanceof Error ? err.message : "تعذر قراءة الصورة");
                } finally {
                  event.target.value = "";
                }
              }}
            />
          </div>
          <p className="text-xs text-[#94a3b8] sm:pt-6">JPG/PNG حتى 1.5MB — تُحفظ مع زر الحفظ</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">الاسم الأول</span>
            <input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">الاسم الثاني</span>
            <input className={fieldClass} value={secondName} onChange={(e) => setSecondName(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-[#0f172a]">اسم العائلة</span>
            <input className={fieldClass} value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
          </label>
          {showEmail ? (
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-[#0f172a]">البريد</span>
              <input
                className={fieldClass}
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
          ) : null}
          {showUniversity ? (
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block font-semibold text-[#0f172a]">الجامعة</span>
              <select
                className={fieldClass}
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
              >
                <option value="">—</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-[#f5a524] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </section>
  );
};
