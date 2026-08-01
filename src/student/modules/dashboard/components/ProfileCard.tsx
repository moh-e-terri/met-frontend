import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import type { StudentDashboardProfile } from "@/student/api";
import { resolveAccountAvatar } from "@/shared/utils/accountAvatar";
import { StudentIcon } from "./StudentIcon";

interface ProfileCardProps {
  profile?: StudentDashboardProfile;
  isLoading?: boolean;
}

export const ProfileCard = ({ profile, isLoading }: ProfileCardProps) => {
  const { session } = useAuth();
  const firstName = session?.name?.split(" ")[0] ?? "طالب";
  const universityName = profile?.universityName ?? session?.universityName;
  const metBalance = profile?.metBalance ?? session?.metBalance;
  const avatar = resolveAccountAvatar(session);

  const tags = [
    universityName
      ? { label: universityName, icon: "/images/student/icon-university.svg" }
      : null,
    metBalance !== undefined
      ? { label: `${metBalance} MET`, icon: "/images/student/icon-wallet.svg" }
      : null,
    profile?.memberSince
      ? {
          label: `عضو منذ ${new Date(profile.memberSince).getFullYear()}`,
          icon: "/images/student/icon-calendar.svg",
        }
      : { label: "عضو في MET E-Academy", icon: "/images/student/icon-calendar.svg" },
  ].filter(Boolean) as Array<{ label: string; icon: string }>;

  return (
    <section className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 md:p-8">
      <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-6">
        <img
          src={avatar}
          alt=""
          className="size-24 shrink-0 self-end rounded-full object-cover sm:size-28 sm:self-auto md:size-32"
          aria-hidden
        />

        <div className="min-w-0 flex-1 text-right">
          <h1 className="text-2xl font-black text-[#0f172a] md:text-3xl">
            أهلاً بك، {firstName}
          </h1>

          {isLoading ? (
            <div className="mt-4 h-5 w-48 animate-pulse rounded-lg bg-[#e2e8f0] self-end" />
          ) : (
            <div className="mt-4 flex flex-wrap items-center justify-end gap-4 text-sm text-[#64748b]">
              {tags.map((tag) => (
                <span key={tag.label} className="inline-flex items-center gap-2">
                  <span>{tag.label}</span>
                  <StudentIcon src={tag.icon} className="size-4 text-[#94a3b8]" />
                </span>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/student/settings"
          className="hidden shrink-0 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#f1f5f9] md:inline-flex md:items-center md:justify-center"
        >
          تعديل الملف الشخصي
        </Link>
      </div>

      <Link
        to="/student/settings"
        className="mt-5 flex w-full items-center justify-center rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-2.5 text-sm font-medium text-[#475569] transition-colors hover:bg-[#f1f5f9] md:hidden"
      >
        تعديل الملف الشخصي
      </Link>
    </section>
  );
};
