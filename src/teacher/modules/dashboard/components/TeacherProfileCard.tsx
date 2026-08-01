import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import { getTeacherBasePath } from "@/core/routing/appSurface";
import { resolveAccountAvatar } from "@/shared/utils/accountAvatar";
import type { TeacherProfile } from "@/teacher/api";
import { TeacherIcon } from "./TeacherIcon";

interface TeacherProfileCardProps {
  profile?: TeacherProfile;
  isLoading?: boolean;
}

export const TeacherProfileCard = ({ profile, isLoading }: TeacherProfileCardProps) => {
  const { session } = useAuth();
  const displayName = session?.name ?? "المحاضر";
  const basePath = getTeacherBasePath();
  const uploadPath = `${basePath}/courses/new`;
  const avatar = resolveAccountAvatar(session);

  const metaItems = [
    profile?.title
      ? { label: profile.title, icon: "/images/student/icon-briefcase.svg" }
      : null,
    profile?.experience
      ? { label: profile.experience, icon: "/images/student/icon-shield.svg" }
      : null,
    profile?.email || session?.email
      ? {
          label: profile?.email || session?.email || "",
          icon: "/images/student/icon-message.svg",
        }
      : null,
  ].filter((item): item is { label: string; icon: string } => Boolean(item));

  if (isLoading) {
    return <div className="h-44 animate-pulse rounded-3xl bg-[#e2e8f0]" />;
  }

  return (
    <section
      className="rounded-3xl border border-[#e2e8f0] bg-white p-5 shadow-sm sm:p-6 md:p-8"
      dir="rtl"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <img
          src={avatar}
          alt=""
          className="size-24 shrink-0 self-end rounded-full object-cover sm:size-28 lg:self-auto xl:size-32"
          aria-hidden
        />

        <div className="min-w-0 flex-1 text-right">
          <h1 className="text-2xl font-black text-[#0f172a] md:text-3xl">
            أهلاً بك، {displayName}
          </h1>
          {profile?.subtitle ? (
            <p className="mt-2 text-sm text-[#64748b]">{profile.subtitle}</p>
          ) : null}

          {metaItems.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-start gap-4 text-sm text-[#64748b]">
              {metaItems.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2">
                  <TeacherIcon src={item.icon} className="size-4 text-[#94a3b8]" />
                  <span dir={item.label.includes("@") ? "ltr" : "rtl"}>{item.label}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link
            to={uploadPath}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f5a524] px-5 py-3 text-sm font-bold text-white shadow-[0px_10px_15px_-3px_rgba(245,165,36,0.2)] transition-transform hover:scale-[1.01]"
          >
            <TeacherIcon
              src="/images/teacher/icon-upload-content.svg"
              className="size-4 text-white"
            />
            <span>رفع محتوى جديد</span>
          </Link>
          <Link
            to={`${basePath}/settings`}
            className="inline-flex items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-5 py-3 text-sm font-semibold text-[#475569] transition-colors hover:bg-[#f8fafc]"
          >
            تعديل الملف
          </Link>
        </div>
      </div>
    </section>
  );
};
