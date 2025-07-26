import { CheckCircle, Circle, Plus, Database, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "create-file",
    title: "Create your first file",
    description: "Start with a blank spreadsheet or import existing data",
    completed: false,
    action: "Create File",
    icon: Plus,
  },
  {
    id: "connect-data",
    title: "Connect a data source",
    description: "Link MySQL, Postgres, Snowflake, BigQuery, or other databases",
    completed: false,
    action: "Add Connection",
    icon: Database,
  },
  {
    id: "invite-team",
    title: "Invite your team",
    description: "Collaborate with teammates in real-time",
    completed: false,
    action: "Invite Members",
    icon: Users,
  },
];

export function GettingStarted() {
  const completedItems = checklistItems.filter(item => item.completed).length;
  const progress = (completedItems / checklistItems.length) * 100;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete these steps to set up your workspace
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedItems}/{checklistItems.length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
        <Progress value={progress} className="w-full mt-3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary-light rounded-lg flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
              <Button 
                variant="workspace" 
                size="sm" 
                disabled={item.completed}
                onClick={() => {
                  if (item.id === "create-file") {
                    window.location.href = '/editor';
                  }
                }}
              >
                {item.completed ? "Completed" : item.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}