import React, { useMemo, useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTasksMutation } from "@/redux/api/apiSlice";
import { Controller } from "react-hook-form";

// enums
const statuses = ["todo", "in-progress", "completed"] as const;
const priorities = ["low", "medium", "high"] as const;

// ✅ Task төрөл
type Task = {
  id: number;
  title: string;
  description?: string;
  status: typeof statuses[number];
  priority: typeof priorities[number];
  dueDate?: string | null;
  assignedTo?: number;
  teamId?: number;
};

// ✅ Props төрөл
interface TaskListProps {
  tasks: Task[];
  title: string;
  isLoading: boolean;
}

// ✅ Zod формын схем
const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().optional(),
  status: z.enum(statuses, { required_error: "Status is required" }),
  priority: z.enum(priorities, { required_error: "Priority is required" }),
  dueDate: z.date().optional(),
  assignedTo: z.number().optional(),
  teamId: z.number().optional(),
});

export function TaskList({ tasks, title, isLoading }: TaskListProps) {
  const [filter, setFilter] = useState<"all" | typeof statuses[number]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [createTask, { isLoading: isCreating }] = useCreateTasksMutation();

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: undefined,
      assignedTo: undefined,
      teamId: undefined,
    },
  });

  const handleFormSubmit: SubmitHandler<z.infer<typeof taskFormSchema>> = async (data) => {
    try {
      const payload = {
        ...data,
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      };
      await createTask(payload).unwrap();
      form.reset();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Task creation failed:", error);
    }
  };

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return []; // ← энэ мөр алдаанаас сэргийлнэ
  
    let filtered = [...tasks];
    if (filter !== "all") {
      filtered = filtered.filter((task) => task.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description?.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [tasks, filter, searchQuery]);
  

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">View and manage your tasks</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative mr-2">
            <Input
              className="pl-9 h-9 bg-white"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <Select value={filter} onValueChange={(val) => setFilter(val as any)}>
            <SelectTrigger className="h-9 w-[150px] mr-2 bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) form.reset();
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-9 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-1" /> New Task
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter task title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter task description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

<div className="grid grid-cols-2 gap-4">
  {/* ✅ STATUS FIELD WITH CONTROLLER */}
  <FormItem>
    <FormLabel>Status</FormLabel>
    <Controller
      control={form.control}
      name="status"
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
    <FormMessage />
  </FormItem>

  {/* ✅ PRIORITY FIELD WITH CONTROLLER */}
  <FormItem>
    <FormLabel>Priority</FormLabel>
    <Controller
      control={form.control}
      name="priority"
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
    <FormMessage />
  </FormItem>
</div>

                  <DialogFooter className="pt-6">
                    <DialogClose asChild>
                      <Button variant="outline" className="mr-2">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isCreating}>
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <p className="text-center text-gray-600">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-center text-gray-600">No tasks found.</p>
        ) : (
          filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
