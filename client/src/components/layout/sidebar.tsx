import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  HomeIcon, 
  CheckSquareIcon, 
  UsersIcon, 
  InboxIcon, 
  TrashIcon, 
  SettingsIcon 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@/components/ui/user-avatar";

const navItems = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/tasks", label: "Tasks", icon: CheckSquareIcon },
  { href: "/team", label: "Team", icon: UsersIcon },
  { href: "/inbox", label: "Inbox", icon: InboxIcon },
  { href: "/trash", label: "Trash", icon: TrashIcon }
];

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
}

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  return (
    <div className="hidden md:block">
      <div className="sidebar">
        <div className="flex items-center justify-center h-16 mb-6 w-full px-4">
          <h1 className="text-xl font-bold hidden md:block">MKa</h1>
          <span className="text-xl font-bold md:hidden">M</span>
        </div>
        
        <div className="flex flex-col flex-grow w-full">
          <nav className="flex-1 space-y-1 w-full px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-link",
                  location === item.href && "active"
                )}
              >
                <item.icon className="h-5 w-5 md:mr-3 flex-shrink-0" />
                <span className="hidden md:block">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto mb-8 px-2 w-full">
            <Link
              href="/profile"
              className={cn(
                "sidebar-link",
                location === "/profile" && "active"
              )}
            >
              <SettingsIcon className="h-5 w-5 md:mr-3 flex-shrink-0" />
              <span className="hidden md:block">Settings</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center px-4 mt-6">
                <div className="flex-shrink-0">
                  {user && (
                    <UserAvatar 
                      user={{
                        id: user.id,
                        fullName: user.fullName,
                        username: user.username,
                        avatar: user.avatar
                      }} 
                      className="h-10 w-10" 
                    />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.fullName}</p>
                  <p className="text-xs font-medium text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
