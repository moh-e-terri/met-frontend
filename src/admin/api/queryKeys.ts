export const adminQueryKeys = {
  stats: ["admin", "stats"] as const,
  universities: (search?: string) => ["admin", "universities", search ?? ""] as const,
  instructors: (params?: { search?: string; page?: number; limit?: number }) =>
    ["admin", "instructors", params ?? {}] as const,
  instructorOptions: ["admin", "instructors", "options"] as const,
  courses: (params?: { page?: number; limit?: number }) =>
    ["admin", "courses", params ?? {}] as const,
  students: (filters: {
    email?: string;
    name?: string;
    universityId?: string;
    page?: number;
    limit?: number;
  }) => ["admin", "students", filters] as const,
  financePayments: (params?: { page?: number; limit?: number }) =>
    ["admin", "finance", "payments", params ?? {}] as const,
};
