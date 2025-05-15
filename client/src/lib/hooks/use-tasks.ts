import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../queryClient";

export function useTasks(options?: { status?: string, isDeleted?: boolean }) {
  return useQuery({
    queryKey: ['/api/tasks', options],
  });
}

export function useTaskStats() {
  return useQuery({
    queryKey: ['/api/tasks/stats/summary'],
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      await apiRequest('PATCH', `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
}

export function useRestoreTask() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/tasks/${id}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/tasks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
}
