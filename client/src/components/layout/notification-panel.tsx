import { useState, useEffect } from "react";
import { Check, MessageSquare, Bell, AlertTriangle, Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "@/lib/utils/date-format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
}

export function NotificationPanel() {
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });
  
  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('PATCH', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
  
  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/notifications/mark-all-read', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
  
  const getIconForType = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'task_completed':
        return <Check className="h-4 w-4" />;
      case 'task_overdue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'team_update':
        return <Users className="h-4 w-4" />;
      case 'task_created':
      case 'task_assigned':
        return <Plus className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-100 text-blue-600';
      case 'task_completed':
        return 'bg-green-100 text-green-600';
      case 'task_overdue':
        return 'bg-amber-100 text-amber-600';
      case 'team_update':
        return 'bg-purple-100 text-purple-600';
      case 'task_created':
      case 'task_assigned':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <aside className="hidden lg:block lg:flex-shrink-0 w-80 border-l border-gray-200 bg-white">
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium">Notifications</h2>
            <p className="text-xs text-gray-500 mt-1">
              {isLoading 
                ? 'Loading...' 
                : `${notifications.filter(n => !n.isRead).length} unread`
              }
            </p>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            className="text-xs h-7"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Clear all
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="text-center text-gray-500 text-sm py-4">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No notifications yet</div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={cn(
                  "border p-3 hover:shadow-sm transition-shadow",
                  !notification.isRead && "border-l-2 border-l-blue-500"
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ${getBgColorForType(notification.type)}`}>
                      {getIconForType(notification.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-1">{notification.title}</p>
                    <p className="text-xs text-gray-500 mb-2">{notification.content}</p>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 py-0 text-xs"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
