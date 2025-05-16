import { useState } from "react";
import { Bell, Menu, Sun, Moon, Search, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface NotificationCount {
  count: number;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user } = useQuery<User>({ queryKey: ["/api/users/current"] });

  const { data: notificationCount } = useQuery<NotificationCount>({
    queryKey: ["/api/notifications/unread-count"],
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-900 shadow-sm">
      {/* Left side - Welcome */}
      <div className="flex flex-col justify-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Hello {user?.fullName?.split(" ")[0] || "there"} 👋
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Let’s get back to work</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex relative mx-4 w-72">
        <Input
          type="text"
          placeholder="Search..."
          className="pl-10 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          {notificationCount?.count && notificationCount.count > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          )}
        </Button>

        {/* Create Task */}
        <Button
          variant="default"
          size="sm"
          className="hidden md:flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create Task</span>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="h-5 w-5 text-gray-300 dark:text-yellow-300" />
          )}
        </Button>

        {/* User Avatar */}
        {user && (
          <UserAvatar
            user={{
              id: user.id,
              fullName: user.fullName,
              username: user.username,
              avatar: user.avatar,
            }}
            className="h-9 w-9"
          />
        )}

        {/* Mobile Menu */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
