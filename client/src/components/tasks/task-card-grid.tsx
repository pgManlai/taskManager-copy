import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MessageSquare, Tag, Trash, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  experiencePoints: number;
  rank: string;
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
  assignedTo?: number;
  createdBy: number;
  teamId?: number;
  team?: Team;
  assignee?: User;
  isDeleted: boolean;
  commentCount?: number;
}

interface TaskCardGridProps {
  tasks: Task[];
  inTrash?: boolean;
}

export function TaskCardGrid({ tasks, inTrash = false }: TaskCardGridProps) {
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      await apiRequest('PATCH', `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tasks/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
  
  const restoreTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('POST', `/api/tasks/${id}/restore`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/stats/summary'] });
    }
  });
  
  const handleStatusChange = (taskId: number, checked: boolean) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: {
        status: checked ? 'completed' : 'todo'
      }
    });
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-50 border-red-100';
      case 'medium':
        return 'text-amber-500 bg-amber-50 border-amber-100';
      case 'low':
        return 'text-green-500 bg-green-50 border-green-100';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-100';
    }
  };
  
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          color: 'bg-purple-500',
          icon: <CheckCircle className="h-3.5 w-3.5 text-purple-500" />
        };
      case 'in-progress':
        return {
          color: 'bg-green-500',
          icon: <Clock className="h-3.5 w-3.5 text-green-500" />
        };
      case 'todo': 
        return {
          color: 'bg-blue-500',
          icon: <Calendar className="h-3.5 w-3.5 text-blue-500" />
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: null
        };
    }
  };
  
  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return 'No due date';
    
    try {
      const date = new Date(dueDate);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    
    return new Date(task.dueDate) < new Date();
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <Card 
          key={task.id}
          className={cn(
            "transition-all duration-200 hover:shadow-md border-t-4",
            task.status === 'completed' ? "border-t-purple-500" : 
            task.status === 'in-progress' ? "border-t-green-500" : 
            "border-t-blue-500",
            isOverdue(task) && task.status !== 'completed' && "border-t-red-500"
          )}
        >
          <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                {!inTrash && (
                  <Checkbox 
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => handleStatusChange(task.id, checked as boolean)}
                    className="mr-2 rounded-sm"
                  />
                )}
                <CardTitle className={cn(
                  "text-sm font-medium",
                  task.status === 'completed' && "line-through text-gray-500"
                )}>
                  {task.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge className={cn(
                  "text-xs py-0.5 px-2 font-normal rounded-sm",
                  getPriorityColor(task.priority)
                )}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {task.description && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                {task.description}
              </p>
            )}
            <div className="flex flex-col space-y-2 text-xs text-gray-500">
              <div className={cn(
                "flex items-center",
                isOverdue(task) && "text-red-500 font-medium"
              )}>
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDueDate(task.dueDate)}
              </div>
              
              {task.team && (
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                  {task.team.name}
                </div>
              )}
              
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-blue-400" />
                {task.commentCount || 0} comments
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            {task.assignee && (
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-1.5">
                  <AvatarImage src={task.assignee.avatar} alt={task.assignee.fullName} />
                  <AvatarFallback>{task.assignee.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600">{task.assignee.username}</span>
                  <span className="text-[10px] text-gray-400">{task.assignee.rank}</span>
                </div>
              </div>
            )}
            
            <div>
              {inTrash ? (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => restoreTaskMutation.mutate(task.id)}
                >
                  Restore
                </Button>
              ) : (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteTaskMutation.mutate(task.id)}
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}