import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  isDeleted: boolean;
}

interface TaskDayProps {
  day: Date;
  tasks: Task[];
  onClick: (day: Date, tasks: Task[]) => void;
}

function TaskDay({ day, tasks, onClick }: TaskDayProps) {
  const hasOverdue = tasks.some(task => 
    task.status !== 'completed' && new Date(task.dueDate!) < new Date()
  );
  const hasUrgent = tasks.some(task => task.priority === 'high');
  
  return (
    <div 
      className={cn(
        "h-full w-full relative",
        tasks.length > 0 && "font-medium",
        hasOverdue && "text-red-600"
      )}
      onClick={() => onClick(day, tasks)}
    >
      <div className="absolute top-0 right-0">
        {tasks.length > 0 && (
          <Badge 
            className={cn(
              "text-[0.6rem] min-w-4 h-4 px-1 rounded-full",
              hasOverdue && "bg-red-500",
              hasUrgent && !hasOverdue && "bg-orange-500",
              !hasUrgent && !hasOverdue && "bg-blue-500"
            )}
          >
            {tasks.length}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface TaskCalendarProps {
  onSelectDate: (date: Date, tasks: Task[]) => void;
}

export function TaskCalendar({ onSelectDate }: TaskCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { isDeleted: false }],
  });
  
  // Group tasks by their due dates
  const tasksByDate = tasks.reduce((acc, task) => {
    if (!task.dueDate) return acc;
    
    const date = new Date(task.dueDate);
    const dateStr = date.toDateString();
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    
    acc[dateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Handle day click on calendar
  const handleDayClick = (day: Date) => {
    const dateStr = day.toDateString();
    const dayTasks = tasksByDate[dateStr] || [];
    onSelectDate(day, dayTasks);
  };
  
  // Navigate between months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };
  
  return (
    <Card className="border shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="px-6 py-4 bg-white border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium">Task Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Calendar
          mode="single"
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          className="rounded-md border-0"
          showOutsideDays={true}
          selected={undefined}
          onSelect={(day) => day && handleDayClick(day)}
          modifiers={{
            hasTasks: Object.keys(tasksByDate).map(dateStr => new Date(dateStr))
          }}
          modifiersClassNames={{
            hasTasks: "has-tasks"
          }}
        />
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Badge className="h-2 w-2 p-0 rounded-full bg-blue-500 mr-1" />
            <span>Normal</span>
          </div>
          <div className="flex items-center">
            <Badge className="h-2 w-2 p-0 rounded-full bg-orange-500 mr-1" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center">
            <Badge className="h-2 w-2 p-0 rounded-full bg-red-500 mr-1" />
            <span>Overdue</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}