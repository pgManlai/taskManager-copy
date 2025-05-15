import { useState } from "react";
import { Bell, Menu, Sun, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export function Header() {
  const { setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  interface NotificationCount {
    count: number;
  }
  
  const { data: notificationCount } = useQuery<NotificationCount>({
    queryKey: ['/api/notifications/unread-count'],
  });
  
  const toggleTheme = () => {
    setTheme('light');
  };
  
  return (
    <div className="flex items-center justify-between h-16 px-6 py-4 bg-white shadow-sm">
      {/* Left side - welcome message */}
      <div className="flex-1">
        <h2 className="text-lg font-medium">Hello {user?.fullName?.split(' ')[0] || 'there'} 👋</h2>
        <p className="text-sm text-gray-500">Let's get back to work</p>
      </div>
      
      {/* Search Bar */}
      <div className="hidden md:flex relative mx-4 w-64">
        <div className="relative flex-1">
          <Input 
            type="text"
            className="pl-10 rounded-full border-gray-200"
            placeholder="Search..."
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Right Side Icons/Profile */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative hidden md:flex">
          <Bell className="h-5 w-5 text-gray-500" />
          {notificationCount?.count && notificationCount.count > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="hidden md:flex items-center gap-1 rounded-full bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Task</span>
        </Button>
        
        <div className="flex items-center">
          {user && (
            <UserAvatar 
              user={{
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar
              }} 
              className="h-8 w-8" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
