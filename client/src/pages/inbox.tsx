import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "@/lib/utils/date-format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, MessageSquare, Bell, AlertTriangle, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}
export default function Inbox() {
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'task_completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'task_overdue':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'team_update':
        return <Users className="h-5 w-5 text-violet-500" />;
      case 'task_created':
      case 'task_assigned':
        return <Plus className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inbox</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View all your notifications and messages</p>
      </div>

      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="flex justify-between text-gray-900 dark:text-white">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white hover:bg-red-600">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <NotificationList notifications={notifications} isLoading={isLoading} getIconForType={getIconForType} />
            </TabsContent>

            <TabsContent value="unread">
              <NotificationList
                notifications={notifications.filter(n => !n.isRead)}
                isLoading={isLoading}
                getIconForType={getIconForType}
                emptyMessage="No unread notifications"
              />
            </TabsContent>

            <TabsContent value="read">
              <NotificationList
                notifications={notifications.filter(n => n.isRead)}
                isLoading={isLoading}
                getIconForType={getIconForType}
                emptyMessage="No read notifications"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationList({
  notifications,
  isLoading,
  getIconForType,
  emptyMessage = "No notifications"
}: {
  notifications: any[],
  isLoading: boolean,
  getIconForType: (type: string) => JSX.Element,
  emptyMessage?: string
}) {
  if (isLoading) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading notifications...</p>;
  }

  if (notifications.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-4">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 border rounded-lg transition-colors ${
            !notification.isRead
              ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
              : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              {getIconForType(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.content}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
