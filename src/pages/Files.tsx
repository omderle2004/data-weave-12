import { MainLayout } from "@/components/layout/MainLayout";
import { FileGrid } from "@/components/dashboard/FileGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Files() {
  const navigate = useNavigate();

  const handleImport = () => {
    // Navigate to editor with import mode
    navigate('/editor?mode=import');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground">
            Manage your spreadsheets, notebooks, and dashboards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="workspace" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => navigate('/editor')}>
            <Plus className="mr-2 h-4 w-4" />
            New File
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search files..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* File Grid */}
      <FileGrid title="All Files" />
      </div>
    </MainLayout>
  );
}