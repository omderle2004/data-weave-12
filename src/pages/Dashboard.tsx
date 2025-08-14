import { MainLayout } from "@/components/layout/MainLayout";
import { GettingStarted } from "@/components/dashboard/GettingStarted";
import { FileGrid } from "@/components/dashboard/FileGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Database, Users, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, John</h1>
          <p className="text-muted-foreground">
            Let's build something amazing with your data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="workspace" asChild>
            <Link to="/editor">
              <Upload className="mr-2 h-4 w-4" />
              Import File
            </Link>
          </Button>
          <Button asChild>
            <Link to="/editor">
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Link>
          </Button>
        </div>
      </div>

      {/* Getting Started Checklist */}
      <GettingStarted />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary-light rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Files</p>
                <p className="text-xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-success/20 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Connections</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-warning/20 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Files */}
      <FileGrid title="Recent Files" />

      {/* Team Files */}
      <FileGrid title="Team Files" />
    </div>
  );
}