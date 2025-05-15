import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "@/lib/utils/date-format";

export function TeamActivity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/activities/recent'],
    staleTime: 30000 // 30 seconds
  });
  
  const getActionText = (activity: any) => {
    if (!activity.user || !activity.entity) return "Performed an action";

    const userName = activity.user?.fullName || "A user";
    const taskTitle = activity.entity?.title || "a task";
    
    switch (activity.action) {
      case 'created':
        return `Created task "${taskTitle}"`;
      case 'completed':
        return `Completed task "${taskTitle}"`;
      case 'commented':
        return `Added comment on "${taskTitle}"`;
      case 'assigned':
        return `Assigned to "${taskTitle}"`;
      case 'updated':
        return `Updated status of "${taskTitle}"`;
      default:
        return `Performed action on "${taskTitle}"`;
    }
  };
  
  return (
    <Card className="border rounded-xl overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <CardTitle className="text-lg font-medium text-gray-900">Team Activity</CardTitle>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Recent activity from your team members</p>
      </CardHeader>
      
      <CardContent className="px-6 py-5">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading activities...</p>
        ) : !activities || (Array.isArray(activities) && activities.length === 0) ? (
          <p className="text-center text-gray-500">No recent activities</p>
        ) : (
          <ul className="space-y-4">
            {Array.isArray(activities) && activities.map((activity: any) => (
              <li key={activity.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  {activity.user && <UserAvatar user={activity.user} className="h-10 w-10" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {activity.user?.fullName || "Unknown User"}
                  </div>
                  <div className="text-sm text-gray-500">{getActionText(activity)}</div>
                  <div className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          View all activity <span aria-hidden="true">&rarr;</span>
        </a>
      </CardFooter>
    </Card>
  );
}
