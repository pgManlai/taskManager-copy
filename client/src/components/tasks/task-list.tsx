import { useMemo, useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CalendarIcon } from "lucide-react";

interface User {
  id: number;
  // Removed unused property 'username'
  fullName: string;
  email: string;
  avatar?: string;
}

interface Team {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdBy: number;
  assignedTo?: number;
  teamId?: number;
  team?: Team;
  assignee?: User;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
}

interface TaskListProps {
  title?: string;
  isTrashView?: boolean;
}

const taskFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().optional(),
  status: z.string({ required_error: "Status is required" }),
  priority: z.string({ required_error: "Priority is required" }),
  dueDate: z.date().optional(),
  assignedTo: z.number().optional(),
  teamId: z.number().optional()
});

export function TaskList({ title = "Tasks", isTrashView = false }: TaskListProps) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks', { isDeleted: isTrashView }],
  });
  
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });
  
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  const form = useForm<z.infer<typeof taskFormSchema>, any, z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
    },
  });
  
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      return await apiRequest('POST', `/api/tasks`, {
        ...data,
        createdBy: currentUser?.id || 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
      form.reset();
      setIsCreateDialogOpen(false);
    },
  });
  
  const handleFormSubmit = (data: z.infer<typeof taskFormSchema>) => {
    createTaskMutation.mutate(data);
  };
  
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    let filtered = [...tasks];
    
    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter(task => task.status === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [tasks, filter, searchQuery]);
  
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isTrashView 
              ? "Deleted tasks can be restored or permanently removed"
              : "View and manage your tasks"
            }
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative mr-2">
            <Input
              className="pl-9 h-9 bg-white"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {!isTrashView && (
            <>
              <Select
                value={filter}
                onValueChange={setFilter}
              >
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
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-9 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-1" />
                    New Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit as SubmitHandler<z.infer<typeof taskFormSchema>>)} className="space-y-4">
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
                              <Textarea 
                                placeholder="Enter task description" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="todo">To Do</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Due Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${
                                        !field.value ? "text-muted-foreground" : ""
                                      }`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date < new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="assignedTo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assign To</FormLabel>
                              <Select
                                onValueChange={val => field.onChange(Number(val))}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users.map(user => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.fullName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="teamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team</FormLabel>
                            <Select
                              onValueChange={val => field.onChange(Number(val))}
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select team" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teams.map(team => (
                                  <SelectItem key={team.id} value={team.id.toString()}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button 
                          type="submit" 
                          disabled={createTaskMutation.isPending}
                        >
                          {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">
            {isTrashView
              ? "No tasks in trash"
              : "No tasks found"
            }
          </p>
        </div>
      ) : (
        <>
          <div className="p-6 space-y-0">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                inTrash={isTrashView}
              />
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{filteredTasks.length}</span> of <span className="font-medium text-gray-900">{tasks.length}</span> tasks
              </div>
              {/*
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
              */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
