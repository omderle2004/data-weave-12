import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { 
  MessageSquare, 
  Send, 
  Download, 
  Upload, 
  Plus,
  Database,
  Server,
  HardDrive,
  Cloud,
  Layers,
  FileSpreadsheet,
  Globe
} from "lucide-react";
import { SpreadsheetGrid } from "@/components/SpreadsheetGrid";
import { FileUpload } from "@/components/FileUpload";
import { VoiceInput } from "@/components/VoiceInput";
import { MainLayout } from "@/components/layout/MainLayout";

export default function SpreadsheetEditor() {
  const [spreadsheetData, setSpreadsheetData] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [chatMessage, setChatMessage] = useState("");

  const handleFileUpload = (data: string[][]) => {
    const newData: Record<string, string> = {};
    const columns = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (colIndex < columns.length && rowIndex < 30) {
          const cellId = `${columns[colIndex]}${rowIndex + 1}`;
          newData[cellId] = cell;
        }
      });
    });
    
    setSpreadsheetData(newData);
  };

  const handleCellChange = (cellId: string, value: string) => {
    setSpreadsheetData(prev => ({
      ...prev,
      [cellId]: value
    }));
  };

  const handleVoiceInput = (text: string) => {
    setChatMessage(text);
  };

  return (
    <MainLayout>
      <ResizablePanelGroup direction="vertical" className="h-[calc(100vh-8rem)]">
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b bg-card p-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Sheet Editor</h1>
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
                            <Database className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">CockroachDB</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Connect to CockroachDB</p>
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Cloud className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">BigQuery</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Connect to Google BigQuery</p>
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Database className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">MariaDB</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Connect to MariaDB</p>
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

                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Database className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Neon</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Connect to Neon database</p>
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </Card>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Spreadsheet Area */}
            <div className="flex-1 overflow-hidden">
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
        
        {/* Ask Question Section - Sticky and Resizable */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <div className="bg-card border-t p-6 h-full sticky bottom-0 z-10">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Ask Me Question</h3>
            </div>
            <div className="flex gap-3 h-[calc(100%-3rem)]">
              <Textarea 
                placeholder="Type your question here..." 
                className="flex-1 min-h-[120px] resize-none"
                rows={5}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <div className="flex flex-col gap-3">
                <VoiceInput onVoiceInput={handleVoiceInput} />
                <Button size="sm" className="h-10 px-4">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </MainLayout>
  );
}