import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export default function Members() {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Create dynamic member data based on current user
  const currentMember = {
    id: 1,
    name: `${profile?.display_name || user?.email?.split('@')[0] || 'User'} (You)`,
    email: user?.email || '',
    role: "Owner",
    avatar: profile?.avatar_url || "/placeholder-avatar.png"
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team members</h1>
        </div>

        {/* Invite Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input 
                placeholder="Email" 
                className="max-w-md"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    Can edit
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Can edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>Can view</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button>Invite</Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentMember.avatar} />
                    <AvatarFallback>
                      {currentMember.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentMember.name}</p>
                    <p className="text-sm text-muted-foreground">{currentMember.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{currentMember.role}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>Change role</DropdownMenuItem>
                      <DropdownMenuItem>Remove from team</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Banner */}
        <Card className="bg-primary-light border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Upgrade to SmartBiz AI Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Get more AI messages, connections, and more.
                </p>
              </div>
              <Button>Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}