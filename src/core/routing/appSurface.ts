export type AppSurface = "website" | "student" | "teacher" | "admin";

export function getAppSurface(): AppSurface {
  const host = window.location.hostname.toLowerCase();

  if (host.startsWith("teacher.")) return "teacher";
  if (host.startsWith("student.")) return "student";
  if (host.startsWith("admin.")) return "admin";

  return "website";
}

export function isTeacherSurface(): boolean {
  return getAppSurface() === "teacher";
}

export function getTeacherBasePath(): string {
  return isTeacherSurface() ? "" : "/teacher";
}

export function getTeacherHomePath(): string {
  return isTeacherSurface() ? "/" : "/teacher";
}

export function isAdminSurface(): boolean {
  return getAppSurface() === "admin";
}

export function getAdminBasePath(): string {
  return isAdminSurface() ? "" : "/admin";
}

export function getAdminHomePath(): string {
  return isAdminSurface() ? "/" : "/admin";
}

export function getSigninPath(): string {
  return "/signin";
}
