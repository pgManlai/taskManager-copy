import { useQuery } from "@tanstack/react-query";

export function useRecentActivities(limit?: number) {
  return useQuery({
    queryKey: ['/api/activities/recent', { limit }],
  });
}
