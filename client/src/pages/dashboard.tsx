import { CheckSquare, ClipboardList, Clock, AlertTriangle, BarChart2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskList } from "@/components/tasks/task-list";
import { TeamActivity } from "@/components/dashboard/team-activity";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export default function Dashboard() {
  const { data: taskStats = { total: 0, completed: 0, inProgress: 0, overdue: 0 }, isLoading } = useQuery<TaskStats>({
    queryKey: ['/api/tasks/stats/summary'],
  });
  
  return (
    <div className="px-6 py-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Your tasks at a glance</p>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Stats and Tasks */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Total Tasks</p>
                    <p className="text-xl font-bold">{taskStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Completed</p>
                    <p className="text-xl font-bold">{taskStats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">In Progress</p>
                    <p className="text-xl font-bold">{taskStats.inProgress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-500">Overdue</p>
                    <p className="text-xl font-bold">{taskStats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tasks Section */}
          <TaskList title="Today's Tasks" />
        </div>
        
        {/* Right Column - Team Activity */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <TeamActivity />
          
          {/* Stats Card */}
          <Card className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-gray-500" />
                <span>Weekly Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="h-40 flex items-center justify-center text-gray-400">
                <p className="text-sm">Task completion chart will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
