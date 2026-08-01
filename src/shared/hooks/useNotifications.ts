import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationsQueryKeys,
  resolveNotificationPathAsync,
  type AppNotification,
  type NotificationsResult,
} from "@/core/api/notifications";

const POLL_MS = 12_000;

export function useNotifications() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [toast, setToast] = useState<AppNotification | null>(null);
  const knownUnreadRef = useRef<number | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const query = useQuery({
    queryKey: [...notificationsQueryKeys.all, session?.userId ?? "guest"],
    queryFn: fetchNotifications,
    enabled: Boolean(session),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const result = query.data;
    if (!result) return;

    const currentIds = new Set(result.notifications.map((item) => item.id));
    const previousIds = knownIdsRef.current;
    const isFirstLoad = knownUnreadRef.current === null;

    if (!isFirstLoad) {
      const newest = result.notifications.find(
        (item) => !item.read && !previousIds.has(item.id),
      );
      if (newest) {
        setToast(newest);
      } else if (
        result.unreadCount > (knownUnreadRef.current ?? 0) &&
        result.notifications[0] &&
        !result.notifications[0].read
      ) {
        setToast(result.notifications[0]);
      }
    }

    knownUnreadRef.current = result.unreadCount;
    knownIdsRef.current = currentIds;
  }, [query.data]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
    },
  });

  const patchLocalRead = (id?: string, all = false) => {
    queryClient.setQueryData<NotificationsResult>(
      [...notificationsQueryKeys.all, session?.userId ?? "guest"],
      (current) => {
        if (!current) return current;
        const notifications = current.notifications.map((item) =>
          all || item.id === id ? { ...item, read: true } : item,
        );
        return {
          ...current,
          unreadCount: all ? 0 : notifications.filter((item) => !item.read).length,
          notifications,
        };
      },
    );
  };

  const handleMarkAllRead = () => {
    patchLocalRead(undefined, true);
    markAllReadMutation.mutate();
  };

  const handleMarkRead = async (id: string) => {
    const target = query.data?.notifications.find((item) => item.id === id);
    if (target && !target.read) {
      patchLocalRead(id);
      markReadMutation.mutate(id);
    }

    if (!target) return;

    const path = await resolveNotificationPathAsync(target, session?.role);
    if (path) {
      navigate(path);
    }
  };

  const dismissToast = () => setToast(null);

  const openToast = () => {
    if (!toast) return;
    handleMarkRead(toast.id);
    setToast(null);
  };

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    handleMarkAllRead,
    handleMarkRead,
    isMarkingAllRead: markAllReadMutation.isPending,
    toast,
    dismissToast,
    openToast,
    refetch: query.refetch,
  };
}
