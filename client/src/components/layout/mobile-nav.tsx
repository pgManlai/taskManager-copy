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

const navItems = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/tasks", label: "Tasks", icon: CheckSquareIcon },
  { href: "/team", label: "Team", icon: UsersIcon },
  { href: "/inbox", label: "Inbox", icon: InboxIcon },
  { href: "/trash", label: "Trash", icon: TrashIcon },
  { href: "/profile", label: "Profile", icon: SettingsIcon }
];

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-3",
              location === item.href
                ? "text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1 hidden">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
