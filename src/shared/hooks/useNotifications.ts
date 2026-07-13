import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/core/auth/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  notificationsQueryKeys,
  type NotificationsResult,
} from "@/core/api/notifications";

export function useNotifications() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: notificationsQueryKeys.all,
    queryFn: fetchNotifications,
    enabled: Boolean(session),
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKeys.all });
    },
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
    queryClient.setQueryData<NotificationsResult>(
      notificationsQueryKeys.all,
      (current) => {
        if (!current) return current;
        return {
          ...current,
          unreadCount: 0,
          notifications: current.notifications.map((item) => ({ ...item, read: true })),
        };
      },
    );
  };

  const handleMarkRead = (id: string) => {
    queryClient.setQueryData<NotificationsResult>(
      notificationsQueryKeys.all,
      (current) => {
        if (!current) return current;

        const notifications = current.notifications.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        );

        return {
          ...current,
          unreadCount: notifications.filter((item) => !item.read).length,
          notifications,
        };
      },
    );
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
  };
}
