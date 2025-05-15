import { useState } from "react";
import { TaskList } from "@/components/tasks/task-list";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { TaskCardGrid } from "@/components/tasks/task-card-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, LayoutGrid, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: number;
  createdBy: number;
  teamId?: number;
  team?: any;
  assignee?: any;
  isDeleted: boolean;
  commentCount?: number;
}

export default function Tasks() {
  const [selectedView, setSelectedView] = useState<"list" | "grid" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { isDeleted: false }],
  });
  
  const handleSelectDate = (date: Date, tasks: Task[]) => {
    setSelectedDate(date);
    setSelectedDateTasks(tasks);
    setIsDateDialogOpen(true);
  };
  
  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-amber-100 text-amber-800 border-amber-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    
    return (
      <Badge className={`${colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"} ml-2`}>
        {priority}
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
        {selectedView === "list" && <TaskList title="All Tasks" />}
        
        {selectedView === "grid" && <TaskCardGrid tasks={tasks} />}
        
        {selectedView === "calendar" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TaskCalendar onSelectDate={handleSelectDate} />
            </div>
            <div>
              <TaskList title="Upcoming Tasks" />
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tasks for {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDateTasks.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No tasks scheduled for this day
            </div>
          ) : (
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              {selectedDateTasks.map(task => (
                <div key={task.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between">
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                      {getPriorityBadge(task.priority)}
                    </h3>
                    <Badge className={`${
                      task.status === 'completed' ? 'bg-purple-100 text-purple-800' : 
                      task.status === 'in-progress' ? 'bg-green-100 text-green-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status === 'in-progress' ? 'In Progress' : 
                       task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <div>
                      {task.assignee && (
                        <span>Assigned to: <span className="font-medium">{task.assignee.fullName}</span></span>
                      )}
                    </div>
                    <div>
                      {task.dueDate && (
                        <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
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
