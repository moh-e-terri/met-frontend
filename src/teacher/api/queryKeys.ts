export const teacherQueryKeys = {
  dashboard: ["instructor", "dashboard"] as const,
  finance: ["instructor", "finance"] as const,
  studentProfile: (studentUserId: string) =>
    ["instructor", "students", studentUserId] as const,
};
