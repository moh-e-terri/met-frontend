export const studentQueryKeys = {
  dashboard: (userId?: string) => ["student", "dashboard", userId ?? "guest"] as const,
  progressOverview: (userId?: string) => ["student", "progress", "overview", userId ?? "guest"] as const,
  communityPosts: (limit: number, userId?: string) =>
    ["student", "community", "posts", limit, userId ?? "guest"] as const,
  notifications: (userId?: string) => ["notifications", userId ?? "guest"] as const,
};
