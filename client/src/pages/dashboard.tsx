import { CheckSquare, ClipboardList, Clock, AlertTriangle, BarChart2 } from "lucide-react";
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
  const { data: taskStats = { total: 0, completed: 0, inProgress: 0, overdue: 0 } } = useQuery<TaskStats>({
    queryKey: ['/api/tasks/stats/summary'],
  });

  const stats = [
    {
      label: "Total Tasks",
      value: taskStats.total,
      icon: <ClipboardList className="h-5 w-5 text-white" />,
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      label: "Completed",
      value: taskStats.completed,
      icon: <CheckSquare className="h-5 w-5 text-white" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "In Progress",
      value: taskStats.inProgress,
      icon: <Clock className="h-5 w-5 text-white" />,
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      label: "Overdue",
      value: taskStats.overdue,
      icon: <AlertTriangle className="h-5 w-5 text-white" />,
      gradient: "from-red-500 to-pink-500",
    },
  ];

  return (
    <div className="px-6 py-8 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Your tasks at a glance</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className={`bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md hover:scale-[1.02] transform transition-all duration-200`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="p-3 bg-white/20 rounded-full">
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/80 font-medium truncate">
                      {stat.label}
                    </p>
                    <p className="text-2xl text-white font-bold">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Today's Tasks */}
          <TaskList title="Today's Tasks" />
        </div>

        {/* Right Side */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <TeamActivity />

          {/* Weekly Stats Placeholder */}
          <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <CardHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <CardTitle className="text-lg font-medium flex items-center gap-2 text-gray-800 dark:text-white">
                <BarChart2 className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                <span>Weekly Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="h-40 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">Task completion chart will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
