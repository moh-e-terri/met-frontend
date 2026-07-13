import { apiClient, type ApiEnvelope } from "./client";
import { asArray, asRecord, pickId, pickNumber, pickString } from "./utils";

export type NotificationType = "community" | "course" | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
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

export function mapNotifications(raw: unknown): AppNotification[] {
  const data = asRecord(raw);
  const items = asArray<Record<string, unknown>>(
    data.notifications ?? data.items ?? (Array.isArray(raw) ? raw : []),
  );

  return items.map((item) => {
    const typeValue = pickString(item.type, item.category).toLowerCase();
    let type: NotificationType = "system";
    if (typeValue.includes("community") || typeValue.includes("post")) type = "community";
    if (typeValue.includes("course") || typeValue.includes("lesson")) type = "course";

    return {
      id: pickId(item),
      title: pickString(item.title, item.subject, "إشعار"),
      message: pickString(item.message, item.content, item.body),
      time: formatRelativeTime(pickString(item.createdAt, item.time, item.date)),
      read: Boolean(item.read ?? item.isRead ?? item.readAt),
      type,
    };
  });
}

export function pickUnreadCount(raw: unknown, notifications: AppNotification[]): number {
  const data = asRecord(raw);
  const unread = pickNumber(data.unreadCount, data.unread);
  if (unread) return unread;
  return notifications.filter((item) => !item.read).length;
}

export async function fetchNotifications(): Promise<NotificationsResult> {
  const response = await apiClient.get<ApiEnvelope<unknown>>("/notifications");
  const notifications = mapNotifications(response.data.data);

  return {
    notifications,
    unreadCount: pickUnreadCount(response.data.data, notifications),
  };
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export const notificationsQueryKeys = {
  all: ["notifications"] as const,
};
