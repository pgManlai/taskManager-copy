import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Award, Star, Trophy, Clock } from "lucide-react";

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  experiencePoints: number;
  rank: string;
}

export default function Profile() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });
  
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <p className="text-center text-gray-500">Loading profile...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <p className="text-center text-gray-500">User not found</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>
      
      <Card className="mb-8 overflow-hidden">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
            <div className="flex flex-col items-center mb-4 sm:mb-0 sm:mr-6">
              <UserAvatar user={user as any} className="h-20 w-20 mb-2" />
              <div className="text-center">
                <span className={`xp-level-badge ${user?.rank?.toLowerCase() || 'beginner'}`}>
                  {user?.rank || 'Beginner'}
                </span>
              </div>
            </div>
            <div className="flex-grow">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Experience Points</span>
                  <span className="text-sm font-medium">{user?.experiencePoints || 0} XP</span>
                </div>
                <Progress 
                  value={
                    !user?.experiencePoints ? 0 :
                    user.rank === 'Beginner' ? Math.min(100, user.experiencePoints / 10) :
                    user.rank === 'Intermediate' ? Math.min(100, (user.experiencePoints - 1000) / 10) :
                    user.rank === 'Expert' ? Math.min(100, (user.experiencePoints - 2000) / 20) :
                    Math.min(100, (user.experiencePoints - 5000) / 50)
                  } 
                  className="h-2 bg-gray-200"
                />
              </div>
              <div className="flex justify-between space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Clock className="h-4 w-4 mr-1" />
                  Task History
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Award className="h-4 w-4 mr-1" />
                  Achievements
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  Rewards
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue={user?.fullName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username || ''} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} />
            </div>
            
            <Button className="mt-2">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progress & Achievements</CardTitle>
          <CardDescription>
            Track your progress and unlock achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium text-blue-800">Tasks Completed</h3>
              <p className="text-3xl font-bold text-blue-700 mt-1">24</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium text-green-800">On-time Rate</h3>
              <p className="text-3xl font-bold text-green-700 mt-1">92%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <h3 className="text-lg font-medium text-purple-800">Streak</h3>
              <p className="text-3xl font-bold text-purple-700 mt-1">7 days</p>
            </div>
          </div>

          <h3 className="font-medium text-gray-900 mb-2">Recent Achievements</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-md">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Productivity Master</h4>
                <p className="text-sm text-gray-600">Completed 5 tasks in one day</p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  +50 XP
                </Badge>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
                <Star className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium">Team Player</h4>
                <p className="text-sm text-gray-600">Assigned tasks to 3 different team members</p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  +25 XP
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-between py-3">
          <span className="text-sm text-gray-600">Next rank: {
            !user?.rank ? 'Intermediate' :
            user.rank === 'Beginner' ? 'Intermediate' : 
            user.rank === 'Intermediate' ? 'Expert' : 
            user.rank === 'Expert' ? 'Master' : 'Legend'
          }</span>
          <span className="text-sm text-gray-600">
            {!user?.rank ? '1000 XP needed' :
             user.rank === 'Beginner' ? `${1000 - (user?.experiencePoints || 0)} XP needed` : 
             user.rank === 'Intermediate' ? `${2000 - (user?.experiencePoints || 0)} XP needed` : 
             user.rank === 'Expert' ? `${5000 - (user?.experiencePoints || 0)} XP needed` : 
             'Max level reached'}
          </span>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            
            <Button className="mt-2">Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
