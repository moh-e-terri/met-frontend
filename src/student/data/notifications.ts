import type { AppNotification } from "@/core/api/notifications";

/** @deprecated Prefer AppNotification from core API */
export type StudentNotification = AppNotification;

export const initialNotifications: AppNotification[] = [];
