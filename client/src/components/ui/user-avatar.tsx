import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    id: number;
    fullName?: string;
    avatar?: string;
    username?: string;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user.username?.substring(0, 2).toUpperCase() || '??';

  return (
    <Avatar className={cn("", className)}>
      <AvatarImage 
        src={user.avatar} 
        alt={user.fullName || user.username || `User ${user.id}`} 
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
