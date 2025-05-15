import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Team() {
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['/api/teams'],
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your team members and collaboration</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoadingTeams ? (
          <p className="text-gray-500">Loading teams...</p>
        ) : (
          teams.map(team => (
            <TeamCard key={team.id} team={team} />
          ))
        )}
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: any }) {
  const { data: members = [], isLoading } = useQuery({
    queryKey: [`/api/teams/${team.id}/members`],
  });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>{team.name}</span>
          <Badge>{members.length} Members</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading team members...</p>
        ) : (
          <div className="space-y-4">
            {members.map((member: any) => (
              <div key={member.id} className="flex items-center">
                <UserAvatar user={member.user} className="h-10 w-10" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{member.user.fullName}</p>
                  <p className="text-sm text-gray-500">{member.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
