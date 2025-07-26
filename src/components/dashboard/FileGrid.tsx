import { useState } from "react";
import {
  FileSpreadsheet,
  MoreHorizontal,
  Star,
  Share2,
  Copy,
  Trash2,
  Eye,
  Download,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  type: "spreadsheet" | "notebook" | "dashboard";
  owner: string;
  lastModified: string;
  shared: boolean;
  starred: boolean;
  size?: string;
}

const sampleFiles: FileItem[] = [
  {
    id: "1",
    name: "Q4 Sales Analysis",
    type: "spreadsheet",
    owner: "John Doe",
    lastModified: "2 hours ago",
    shared: true,
    starred: true,
  },
  {
    id: "2",
    name: "Customer Database Query",
    type: "notebook",
    owner: "Jane Smith",
    lastModified: "1 day ago",
    shared: false,
    starred: false,
  },
  {
    id: "3",
    name: "Revenue Dashboard",
    type: "dashboard",
    owner: "Mike Johnson",
    lastModified: "3 days ago",
    shared: true,
    starred: false,
  },
  {
    id: "4",
    name: "Inventory Tracking",
    type: "spreadsheet",
    owner: "Sarah Wilson",
    lastModified: "1 week ago",
    shared: false,
    starred: true,
  },
];

type ViewMode = "grid" | "list";

interface FileGridProps {
  title: string;
  showViewToggle?: boolean;
}

export function FileGrid({ title, showViewToggle = true }: FileGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "spreadsheet":
        return FileSpreadsheet;
      case "notebook":
        return FileSpreadsheet; // You can add different icons
      case "dashboard":
        return FileSpreadsheet; // You can add different icons
      default:
        return FileSpreadsheet;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      spreadsheet: { label: "Sheet", className: "bg-blue-100 text-blue-800" },
      notebook: { label: "Notebook", className: "bg-purple-100 text-purple-800" },
      dashboard: { label: "Dashboard", className: "bg-green-100 text-green-800" },
    };
    return badges[type as keyof typeof badges] || badges.spreadsheet;
  };

  const ViewToggle = () => (
    showViewToggle && (
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("grid")}
          className="h-8 w-8 p-0"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    )
  );

  const FileActions = ({ file }: { file: FileItem }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.location.href = '/editor'}>
          <Eye className="mr-2 h-4 w-4" />
          Open
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Star className="mr-2 h-4 w-4" />
          {file.starred ? "Remove star" : "Add star"}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <ViewToggle />
        </div>
        
        <div className="space-y-2">
          {sampleFiles.map((file) => {
            const Icon = getTypeIcon(file.type);
            const badge = getTypeBadge(file.type);
            
            return (
              <div
                key={file.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-file-hover transition-colors cursor-pointer group"
                onClick={() => window.location.href = '/editor'}
              >
                <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{file.name}</h4>
                    {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className={cn("text-xs", badge.className)}>
                      {badge.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{file.owner}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{file.lastModified}</div>
                <FileActions file={file} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <ViewToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sampleFiles.map((file) => {
          const Icon = getTypeIcon(file.type);
          const badge = getTypeBadge(file.type);
          
          return (
            <Card 
              key={file.id} 
              className="hover:bg-file-hover transition-colors cursor-pointer group"
              onClick={() => window.location.href = '/editor'}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary-light rounded-lg flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      {file.starred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      {file.shared && <Share2 className="h-3 w-3 text-blue-500" />}
                    </div>
                  </div>
                  <FileActions file={file} />
                </div>
                
                <h4 className="font-medium text-sm mb-2 line-clamp-2">{file.name}</h4>
                
                <div className="space-y-2">
                  <Badge variant="secondary" className={cn("text-xs", badge.className)}>
                    {badge.label}
                  </Badge>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{file.owner}</span>
                    <span>{file.lastModified}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}