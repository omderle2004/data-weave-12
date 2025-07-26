import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Database, MoreHorizontal, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Connection {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  database?: string;
  host?: string;
}

const connections: Connection[] = [
  {
    id: "1",
    name: "Production Database",
    type: "PostgreSQL",
    status: "connected",
    lastSync: "2 minutes ago",
    database: "ecommerce_prod",
    host: "prod-db.company.com",
  },
  {
    id: "2", 
    name: "Analytics Warehouse",
    type: "Snowflake",
    status: "connected",
    lastSync: "1 hour ago",
    database: "analytics_warehouse",
    host: "company.snowflakecomputing.com",
  },
  {
    id: "3",
    name: "Marketing Database", 
    type: "MySQL",
    status: "error",
    lastSync: "3 days ago",
    database: "marketing_db",
    host: "marketing-db.internal",
  },
  {
    id: "4",
    name: "BigQuery Analytics",
    type: "BigQuery", 
    status: "disconnected",
    lastSync: "1 week ago",
    database: "analytics-project.dataset",
    host: "bigquery.googleapis.com",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "connected":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "disconnected":
      return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Wifi className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "connected":
      return <Badge className="bg-success/10 text-success border-success/20">Connected</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    case "disconnected":
      return <Badge variant="secondary">Disconnected</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

export default function Connections() {
  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Connections</h1>
          <p className="text-muted-foreground">
            Connect to databases and data sources for real-time collaboration
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Connection Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["PostgreSQL", "MySQL", "Snowflake", "BigQuery"].map((type) => (
          <Card key={type} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="h-12 w-12 bg-primary-light rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-sm">{type}</h3>
              <p className="text-xs text-muted-foreground mt-1">Connect to {type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Connections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Connections</h2>
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary-light rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{connection.name}</h3>
                        {getStatusIcon(connection.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{connection.type}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {connection.database}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Last sync: {connection.lastSync}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(connection.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Test Connection</DropdownMenuItem>
                        <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                        <DropdownMenuItem>View Schema</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete Connection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </MainLayout>
  );
}