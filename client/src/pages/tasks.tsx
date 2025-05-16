import { useState } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { TaskCardGrid } from "@/components/tasks/task-card-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutGrid, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useGetTasksQuery } from "@/redux/api/apiSlice";

interface TeamMember {
  name: string;
  title: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  stage: string;           // todo, in_progress, completed гэх мэт
  priority: string;        // high, medium, low
  startDate?: string;
  endDate?: string | null;
  isTrashed: boolean;
  team?: TeamMember[];

  // Нэмэлт талбарууд
  assets?: string[];
  links?: string[];
  ownerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}


export default function Tasks() {
  const [selectedView, setSelectedView] = useState<"list" | "grid" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

  // RTK Query ашиглаж task-уудыг татаж авна
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();

  // Огноогоор task сонгох үед dialog нээх
  const handleSelectDate = (date: Date, tasksForDate: Task[]) => {
    setSelectedDate(date);
    setSelectedDateTasks(tasksForDate);
    setIsDateDialogOpen(true);
  };

  // Priority-г өнгөөр үзүүлэх badge үүсгэх функц
  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      low: "bg-green-100 text-green-800 border-green-200",
    };

    return (
      <Badge
        className={`${colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"} ml-2`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  // Status-ийн өнгө үзүүлэх badge
  const getStatusBadge = (status: string) => {
    const statusColors = {
      todo: "bg-blue-100 text-blue-800",
      in_progress: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800",
    };
    const displayText =
      status === "in_progress"
        ? "In Progress"
        : status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {displayText}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and organize all your tasks</p>
        </div>

        <Tabs
          value={selectedView}
          onValueChange={(value) => setSelectedView(value as "list" | "grid" | "calendar")}
          className="w-auto"
        >
          <TabsList className="bg-gray-100">
            <TabsTrigger value="list" className="data-[state=active]:bg-white">
              <List className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="data-[state=active]:bg-white">
              <LayoutGrid className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-white">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {selectedView === "list" && <TaskList tasks={tasks} title="All Tasks" isLoading={isLoading} />}
        {selectedView === "grid" && <TaskCardGrid tasks={tasks} />}
        {selectedView === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskCalendar onSelectDate={handleSelectDate}/>
            </div>
            <div>
              <TaskList tasks={tasks.filter(t => {
                if (!t.endDate) return true;
                return new Date(t.endDate) > new Date();
              })} title="Upcoming Tasks" isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tasks for{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>

          {selectedDateTasks.length === 0 ? (
            <div className="py-4 text-center text-gray-500">No tasks scheduled for this day</div>
          ) : (
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between">
                    <h3
                      className={`font-medium ${
                        task.stage === "completed" ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                      {getPriorityBadge(task.priority)}
                    </h3>
                    {getStatusBadge(task.stage)}
                  </div>

                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                  )}

                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <div>
                      {task.team && task.team.length > 0 && (
                        <span>
                          Team:{" "}
                          <span className="font-medium">
                            {task.team.map((member) => member.name).join(", ")}
                          </span>
                        </span>
                      )}
                    </div>
                    <div>
                      {task.endDate && (
                        <span>
                          Due {formatDistanceToNow(new Date(task.endDate), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
