import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/tasks/status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Calendar, MessageSquare, ClipboardList, Trash, Undo, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/utils/date-format";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: any;
  inTrash?: boolean;
}

export function TaskCard({ task, inTrash = false }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  const handleStatusChange = (checked: boolean) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: {
        status: checked ? 'completed' : 'todo'
      }
    });
  };
  
  const getDueDate = () => {
    if (!task.dueDate) return 'No due date';
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    if (dueDate < now && task.status !== 'completed') {
      return `Overdue (${formatDistanceToNow(dueDate)})`;
    }
    
    if (dueDate.toDateString() === now.toDateString()) {
      return 'Due today';
    }
    
    if (dueDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()) {
      return 'Due tomorrow';
    }
    
    return formatDistanceToNow(dueDate, { addSuffix: true });
  };
  
  const isOverdue = () => {
    if (!task.dueDate) return false;
    
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    
    return dueDate < now && task.status !== 'completed';
  };
  
  const getPriorityColor = () => {
    switch (task.priority) {
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
  
  const getStatusClass = () => {
    switch (task.status) {
      case 'completed':
        return 'completed';
      case 'in-progress':
        return 'in-progress';
      case 'todo': 
        return 'todo';
      default:
        return '';
    }
  };
  
  return (
    <div 
      className={cn(
        "task-card p-4 mb-3",
        getStatusClass(),
        isHovered && "shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {!inTrash && (
          <div className="pt-0.5">
            <Checkbox 
              checked={task.status === 'completed'}
              onCheckedChange={handleStatusChange}
              className="rounded-sm"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={cn("text-xs py-0.5 px-2 font-normal rounded-sm", getPriorityColor())}>
                {task.priority}
              </Badge>
              
              <StatusBadge status={task.status} />
            </div>
          </div>
          
          {task.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
            <div className={`flex items-center p-1 rounded ${isOverdue() ? 'text-red-500' : ''}`}>
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {getDueDate()}
            </div>
            
            {task.team && (
              <div className="flex items-center p-1 rounded">
                <Users className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                {task.team.name}
              </div>
            )}
            
            <div className="flex items-center p-1 rounded">
              <MessageSquare className="h-3.5 w-3.5 mr-1 text-blue-400" />
              {task.commentCount || 0}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            {task.assignee && (
              <div className="flex items-center">
                <UserAvatar user={task.assignee} className="w-5 h-5 mr-1.5" />
                <span className="text-xs text-gray-600">{task.assignee.username}</span>
              </div>
            )}
            
            <div className="flex gap-1">
              {isHovered && inTrash && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => restoreTaskMutation.mutate(task.id)}
                >
                  <Undo className="h-3.5 w-3.5 mr-1" />
                  <span>Restore</span>
                </Button>
              )}
              
              {isHovered && !inTrash && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => deleteTaskMutation.mutate(task.id)}
                >
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
