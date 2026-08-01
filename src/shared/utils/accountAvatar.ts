import type { AuthSession } from "@/core/auth/types";

export function defaultAvatarForRole(role?: string): string {
  if (role === "admin") return "/images/admin/avatar-admin.svg";
  if (role === "teacher") return "/images/teacher/avatar-teacher-default.svg";
  return "/images/student/avatar-student-default.svg";
}

/** Prefer the real uploaded account photo; fall back to role default only when missing. */
export function resolveAccountAvatar(
  session?: Pick<AuthSession, "avatar" | "role"> | null,
  fallback?: string | null,
): string {
  const real = session?.avatar?.trim();
  if (real) return real;
  const extra = fallback?.trim();
  if (extra) return extra;
  return defaultAvatarForRole(session?.role);
}
