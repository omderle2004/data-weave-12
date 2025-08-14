import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { 
  MessageSquare, 
  Download, 
  Upload,
  Plus,
  Database,
  Server,
  HardDrive,
  Cloud,
  Layers,
  FileSpreadsheet,
  Brain
} from "lucide-react";
import { SpreadsheetGrid } from "@/components/SpreadsheetGrid";
import { FileUpload } from "@/components/FileUpload";
import { VoiceInput } from "@/components/VoiceInput";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";

export default function SpreadsheetEditor() {
  const [spreadsheetData, setSpreadsheetData] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (data: string[][], uploadedFileName: string) => {
    const newData: Record<string, string> = {};
    const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (colIndex < columns.length && rowIndex < 100) {
          const cellId = `${columns[colIndex]}${rowIndex + 1}`;
          newData[cellId] = cell ? String(cell) : "";
        }
      });
    });
    
    setSpreadsheetData(newData);
    setFileName(uploadedFileName);
  };

  const handleCellChange = (cellId: string, value: string) => {
    setSpreadsheetData(prev => ({
      ...prev,
      [cellId]: value
    }));
  };

  const exportData = () => {
    const dataEntries = Object.entries(spreadsheetData).filter(([_, value]) => value.trim() !== "");
    if (dataEntries.length === 0) {
      alert("No data to export");
      return;
    }

    // Convert to CSV format
    const maxRow = Math.max(...dataEntries.map(([cellId]) => parseInt(cellId.match(/\d+/)?.[0] || "0")));
    const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    
    let csvContent = "";
    for (let row = 1; row <= maxRow; row++) {
      const rowData = columns.map(col => spreadsheetData[`${col}${row}`] || "");
      csvContent += rowData.join(",") + "\n";
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? fileName.replace(/\.[^/.]+$/, "") + "_exported.csv" : "spreadsheet_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={70} minSize={50}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">SmartBiz AI Spreadsheet</h1>
                {fileName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Current file: {fileName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FileUpload onFileUpload={handleFileUpload} />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Upload className="h-4 w-4 mr-1" />
                      Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {/* File Upload Section */}
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileSpreadsheet className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Upload File</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Upload CSV or Excel files</p>
                        <FileUpload onFileUpload={handleFileUpload} />
                      </Card>

                      {/* Database Connections */}
                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">MySQL</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Connect to MySQL database</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Database className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">PostgreSQL</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Connect to PostgreSQL database</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Server className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">MS SQL Server</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Connect to SQL Server</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Cloud className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Snowflake</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Connect to Snowflake</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Layers className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Supabase</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Connect to Supabase</p>
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      </Card>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" className="h-8" onClick={exportData}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Spreadsheet Area */}
          <div className="flex-1 overflow-hidden p-4">
            <SpreadsheetGrid 
              data={spreadsheetData}
              onCellChange={handleCellChange}
              selectedCell={selectedCell}
              onCellSelect={setSelectedCell}
            />
          </div>
        </div>
      </ResizablePanel>
      
      <ResizableHandle />
      
      {/* AI Analysis Panel */}
      <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
        <div className="bg-card border-l p-6 h-full overflow-auto">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">AI Data Analysis</h3>
          </div>
          <AIAnalysisPanel data={spreadsheetData} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}