import { apiClient, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export type NotificationType =
  | "community"
  | "course"
  | "system"
  | "chat"
  | "finance";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
  relatedId?: string;
  relatedType?: string;
  /** Course id when the notification targets a course-scoped post/resource. */
  courseId?: string;
  rawType?: string;
  createdAt?: string;
}

export interface NotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
}

function formatRelativeTime(value?: string): string {
  if (!value) return "منذ قليل";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA");
}

function mapNotificationType(rawType: string): NotificationType {
  const value = rawType.toLowerCase();
  if (value.includes("chat") || value.includes("message") || value.includes("محادثة")) {
    return "chat";
  }
  if (
    value.includes("finance") ||
    value.includes("payment") ||
    value.includes("met") ||
    value.includes("refund") ||
    value.includes("release") ||
    value.includes("enroll")
  ) {
    return "finance";
  }
  if (
    value.includes("community") ||
    value.includes("post") ||
    value.includes("reply") ||
    value.includes("comment") ||
    value.includes("like")
  ) {
    return "community";
  }
  if (
    value.includes("course") ||
    value.includes("lesson") ||
    value.includes("exam") ||
    value.includes("assignment") ||
    value.includes("quiz")
  ) {
    return "course";
  }
  return "system";
}

export function mapNotifications(raw: unknown): AppNotification[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.notifications ?? data.items ?? data.data ?? (Array.isArray(raw) ? raw : []),
  );

  return items.flatMap((item) => {
    const id = pickId(item);
    if (!id) return [];
    const rawType = pickString(item.type, item.category, item.kind);

    const nested = asRecord(item.data ?? item.meta ?? item.payload ?? item.ref);
    const relatedId =
      pickString(
        item.relatedId,
        item.entityId,
        item.refId,
        item.postId,
        item.conversationId,
        nested.relatedId,
        nested.postId,
        nested.entityId,
      ) || undefined;
    const courseId =
      pickString(
        item.courseId,
        nested.courseId,
        asRecord(item.course).id,
        asRecord(item.course)._id,
        asRecord(nested.course).id,
        asRecord(nested.course)._id,
      ) ||
      (pickString(item.relatedType, nested.relatedType).toLowerCase() === "course"
        ? pickString(item.relatedId, nested.relatedId)
        : "") ||
      undefined;

    const notification: AppNotification = {
      id,
      title: pickString(item.title, item.subject) || "إشعار",
      message: pickString(item.message, item.content, item.body) || "",
      time: formatRelativeTime(pickString(item.createdAt, item.time, item.date)),
      read: Boolean(item.read ?? item.isRead ?? item.readAt),
      type: mapNotificationType(rawType),
      relatedId,
      relatedType:
        pickString(item.relatedType, item.entityType, item.refType, nested.relatedType) ||
        undefined,
      courseId: courseId || undefined,
      rawType: rawType || undefined,
      createdAt: pickString(item.createdAt, item.time, item.date) || undefined,
    };

    return [notification];
  });
}

export function pickUnreadCount(
  envelope: unknown,
  payload: unknown,
  notifications: AppNotification[],
): number {
  const root = asRecord(envelope);
  const data = asRecord(payload);
  const pagination = asRecord(root.pagination ?? data.pagination);

  if ("unreadCount" in pagination) return pickNumber(pagination.unreadCount);
  if ("unreadCount" in root) return pickNumber(root.unreadCount);
  if ("unreadCount" in data) return pickNumber(data.unreadCount);

  return notifications.filter((item) => !item.read).length;
}

export async function fetchNotifications(): Promise<NotificationsResult> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/notifications", {
    params: { limit: 30 },
  });

  const envelope = response.data;
  const payload = envelope.data;
  const notifications = mapNotifications(
    Array.isArray(payload) ? payload : payload ?? envelope,
  );

  return {
    notifications,
    unreadCount: pickUnreadCount(envelope, payload, notifications),
  };
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.patch(`/notifications/${notificationId}/read`);
}

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
};

export function resolveNotificationPath(
  notification: AppNotification,
  role?: string,
): string | null {
  const base =
    role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
  const relatedType = (notification.relatedType || notification.rawType || "").toLowerCase();
  const id = notification.relatedId;
  const courseId = notification.courseId;

  if (
    notification.type === "chat" ||
    relatedType.includes("chat") ||
    relatedType.includes("message") ||
    relatedType.includes("conversation")
  ) {
    return id
      ? `${base}/chats?conversationId=${encodeURIComponent(id)}`
      : `${base}/chats`;
  }

  if (
    relatedType.includes("post") ||
    relatedType.includes("comment") ||
    relatedType.includes("reply") ||
    notification.type === "community"
  ) {
    return buildCommunityPostPath(base, id, courseId);
  }

  if (id && (relatedType.includes("course") || notification.type === "course")) {
    // Assignment/exam notifications often send relatedType=Course with course id.
    if (role === "student") return `/student/courses/${id}`;
    if (role === "teacher") return `/teacher/courses/${id}`;
    return `/admin/courses/${id}`;
  }

  if (notification.type === "finance") {
    if (role === "admin") return "/admin/financials";
    if (role === "teacher") return "/teacher/payments";
    return "/student/payments";
  }

  return null;
}

function buildCommunityPostPath(
  base: string,
  postId?: string,
  courseId?: string,
): string {
  const query = postId
    ? `?postId=${encodeURIComponent(postId)}&comments=1`
    : "";

  if (courseId) {
    return `${base}/courses/${courseId}/community${query}`;
  }

  return `${base}/community${query}`;
}

const POST_SCOPE_PREFIX = "met_post_community_scope:";

export function rememberPostCommunityScope(
  postId: string,
  courseId?: string | null,
) {
  if (!postId || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(POST_SCOPE_PREFIX + postId, courseId || "global");
  } catch {
    // ignore quota / private mode
  }
}

export function recallPostCommunityScope(postId: string): string | null | undefined {
  if (!postId || typeof sessionStorage === "undefined") return undefined;
  try {
    const value = sessionStorage.getItem(POST_SCOPE_PREFIX + postId);
    if (value == null) return undefined;
    return value === "global" ? null : value;
  } catch {
    return undefined;
  }
}

async function fetchAccessibleCourseIds(role?: string): Promise<string[]> {
  try {
    if (role === "teacher") {
      const response = await apiClient.get<ApiEnvelope<unknown>>("/instructor/dashboard");
      const data = asRecord(response.data.data);
      return asArray<Record<string, unknown>>(
        data.courses ?? data.myCourses ?? data.items,
      )
        .map((item) => pickId(item) || pickId(asRecord(item.course)))
        .filter(Boolean);
    }

    if (role === "admin") {
      const response = await apiClient.get<ApiEnvelope<unknown>>("/admin/courses", {
        params: { limit: 50 },
      });
      const data = asRecord(response.data.data);
      return asArray<Record<string, unknown>>(
        data.courses ?? data.items ?? (Array.isArray(response.data.data) ? response.data.data : []),
      )
        .map((item) => pickId(item))
        .filter(Boolean);
    }

    const response = await apiClient.get<ApiEnvelope<unknown>>("/student/dashboard");
    const data = asRecord(response.data.data);
    return asArray<Record<string, unknown>>(data.enrolledCourses ?? data.courses)
      .map((item) => {
        const course = asRecord(item.course ?? item.courseId ?? item);
        return pickId(course) || pickId(item);
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function postExistsInCourseFeed(
  courseId: string,
  postId: string,
): Promise<boolean> {
  try {
    const response = await apiClient.get<ApiEnvelope<unknown>>(
      `/community/courses/${courseId}/posts`,
      { params: { limit: 50, page: 1 } },
    );
    const data = asRecord(response.data.data ?? response.data);
    const posts = asArray<Record<string, unknown>>(
      data.posts ?? data.items ?? (Array.isArray(response.data.data) ? response.data.data : []),
    );
    return posts.some((post) => pickId(post) === postId);
  } catch {
    return false;
  }
}

async function postExistsInGlobalFeed(postId: string): Promise<boolean> {
  try {
    const response = await apiClient.get<ApiEnvelope<unknown>>("/community/posts", {
      params: { limit: 50, page: 1 },
    });
    const data = asRecord(response.data.data ?? response.data);
    const posts = asArray<Record<string, unknown>>(
      data.posts ?? data.items ?? (Array.isArray(response.data.data) ? response.data.data : []),
    );
    return posts.some((post) => {
      if (pickId(post) !== postId) return false;
      const courseId = pickString(post.courseId) || pickId(asRecord(post.courseId));
      return !courseId;
    });
  } catch {
    return false;
  }
}

/** Resolve community notification to the correct public/course community URL. */
export async function resolveNotificationPathAsync(
  notification: AppNotification,
  role?: string,
): Promise<string | null> {
  const base =
    role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
  const relatedType = (notification.relatedType || notification.rawType || "").toLowerCase();
  const isCommunityTarget =
    relatedType.includes("post") ||
    relatedType.includes("comment") ||
    relatedType.includes("reply") ||
    notification.type === "community";

  if (!isCommunityTarget) {
    return resolveNotificationPath(notification, role);
  }

  const postId = notification.relatedId;
  if (!postId) {
    return buildCommunityPostPath(base);
  }

  if (notification.courseId) {
    rememberPostCommunityScope(postId, notification.courseId);
    return buildCommunityPostPath(base, postId, notification.courseId);
  }

  const cached = recallPostCommunityScope(postId);
  if (cached !== undefined) {
    return buildCommunityPostPath(base, postId, cached || undefined);
  }

  if (await postExistsInGlobalFeed(postId)) {
    rememberPostCommunityScope(postId, null);
    return buildCommunityPostPath(base, postId);
  }

  const courseIds = await fetchAccessibleCourseIds(role);
  const matches = await Promise.all(
    courseIds.map(async (courseId) =>
      (await postExistsInCourseFeed(courseId, postId)) ? courseId : null,
    ),
  );
  const courseId = matches.find((value): value is string => Boolean(value));

  if (courseId) {
    rememberPostCommunityScope(postId, courseId);
    return buildCommunityPostPath(base, postId, courseId);
  }

  // Fallback: general community (may not contain the post, but keeps prior behavior).
  return buildCommunityPostPath(base, postId);
}
