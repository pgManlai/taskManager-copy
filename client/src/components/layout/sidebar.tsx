import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation().pathname;
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-900 text-gray-100 min-h-screen shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-gray-700 px-6">
        <h1 className="text-2xl font-extrabold tracking-wide select-none">MKa</h1>
      </div>
      
      <nav className="flex flex-col flex-grow px-4 mt-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = location === href;
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 mr-3" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-6 border-t border-gray-700">
        <Link
          to="/profile"
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
            location === "/profile"
              ? "bg-indigo-600 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
        >
          <SettingsIcon className="h-5 w-5 mr-3" aria-hidden="true" />
          <span>Settings</span>
        </Link>

        {user && (
          <div className="flex items-center mt-6 space-x-3">
            <UserAvatar 
              user={{
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar
              }} 
              className="h-10 w-10 rounded-full border-2 border-indigo-600" 
            />
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{user.fullName}</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
