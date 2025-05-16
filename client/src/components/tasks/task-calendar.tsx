import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGetTasksQuery } from '@/redux/api/apiSlice';

interface TeamMember {
  name: string;
  title: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  stage: string;
  priority: string;        // high, medium, low
  startDate?: string;
  endDate?: string | null;
  isTrashed: boolean;
  team?: TeamMember[];
  assets?: string[];
  links?: string[];
  ownerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskCalendarProps {
  onSelectDate: (date: Date, tasksForDate: Task[]) => void;
}

export function TaskCalendar({ onSelectDate }: TaskCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // RTK Query ашиглан task-ууд татах
  const { data: tasks = [], isLoading } = useGetTasksQuery();

  // isTrashed=false filter хийсэн таскууд
  const visibleTasks = useMemo(() => tasks.filter(task => !task.isTrashed), [tasks]);

  // Огноогоор бүлэглэх
  const tasksByDate = useMemo(() => {
    return visibleTasks.reduce<Record<string, Task[]>>((acc, task) => {
      if (!task.endDate) return acc;
      const dateStr = new Date(task.endDate).toDateString();
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(task);
      return acc;
    }, {});
  }, [visibleTasks]);

  // Priority болон overdue тэмдэглэгээ
  const highPriorityDates = useMemo(() => {
    return visibleTasks
      .filter(task => task.priority === 'high' && task.endDate)
      .map(task => new Date(task.endDate!));
  }, [visibleTasks]);

  const overdueDates = useMemo(() => {
    const today = new Date();
    return visibleTasks
      .filter(task => task.endDate && new Date(task.endDate) < today)
      .map(task => new Date(task.endDate!));
  }, [visibleTasks]);

  const hasTasksDates = useMemo(() => {
    return Object.keys(tasksByDate).map(dateStr => new Date(dateStr));
  }, [tasksByDate]);

  // Өдөр сонгоход ажиллах функц
  const handleDayClick = (day: Date) => {
    const dateStr = day.toDateString();
    onSelectDate(day, tasksByDate[dateStr] || []);
  };

  // Сар шилжүүлэх
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(direction === 'prev' ? newDate.getMonth() - 1 : newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  return (
    <Card className="border shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100">
        <CardTitle className="text-lg font-medium">Task Calendar</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateMonth('prev')}
            aria-label="Previous Month"
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
            aria-label="Next Month"
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
            hasTasks: hasTasksDates,
            highPriority: highPriorityDates,
            overdue: overdueDates,
          }}
          modifiersClassNames={{
            hasTasks: "has-tasks",
            highPriority: "high-priority",
            overdue: "overdue",
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
