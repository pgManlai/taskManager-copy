import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useNotifications() {
  return useQuery({
    queryKey: ['/api/notifications'],
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['/api/notifications/unread-count'],
  });
}

export function useMarkNotificationAsRead() {
  return useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('PATCH', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
}

export function useMarkAllNotificationsAsRead() {
  return useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/mark-all-read', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
}
