import { cn } from "@/lib/utils";
import { Circle, Clock, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'in-progress':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'todo':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'high priority':
      case 'overdue':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
        return 'In Progress';
      case 'todo':
        return 'To Do';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'in-progress':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'todo':
        return <Circle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <span className={cn(
      "px-2 py-0.5 inline-flex items-center text-xs leading-4 font-medium rounded-sm border",
      getStatusColor(status),
      className
    )}>
      {getStatusIcon(status)}
      {getStatusLabel(status)}
    </span>
  );
}
