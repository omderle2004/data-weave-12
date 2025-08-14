import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  File, Edit3, Eye, Plus, Type, HelpCircle, MessageSquare,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Merge, DollarSign, Percent, Hash, Calendar, Grid3x3,
  Share, Users, User, ZoomIn, Wifi, ChevronDown, Search,
  Sparkles, BarChart3, Code2, Settings, Send, Paperclip,
  Image, ChevronLeft, ChevronRight, X, Undo, Redo, Scissors,
  Copy, FileText, Calculator, PieChart, Table, CheckSquare,
  Palette, ArrowUpDown, Trash2, ExternalLink, BookOpen,
  Github, Twitter, Mail, Database, Upload, FileUp, Link, Code
} from "lucide-react";
import { FileImport } from "@/components/FileImport";
import { ResizableQuestionPanel } from "@/components/ResizableQuestionPanel";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Cell {
  id: string;
  value: string;
  type: 'text' | 'number' | 'formula' | 'code';
  language?: 'python' | 'javascript' | 'formula';
}

export default function SpreadsheetEditor() {
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCellTypeModal, setShowCellTypeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [importedData, setImportedData] = useState<string[][] | null>(null);
  const [showSidebarToggle, setShowSidebarToggle] = useState(false);

  // Check URL params to auto-open import modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'import') {
      setShowImportModal(true);
    }
  }, []);

  // Generate grid data
  const columns = Array.from({ length: 15 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  const getCellId = (col: string, row: number) => `${col}${row}`;
  
  const getCellValue = (cellId: string) => {
    return cells[cellId]?.value || "";
  };

  const updateCell = (cellId: string, value: string) => {
    setCells(prev => ({
      ...prev,
      [cellId]: { id: cellId, value, type: 'text' }
    }));
  };

  const handleDataImport = (data: string[][]) => {
    setImportedData(data);
    const newCells: Record<string, Cell> = {};
    
    data.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        if (colIndex < columns.length && rowIndex < rows.length) {
          const cellId = getCellId(columns[colIndex], rowIndex + 1);
          newCells[cellId] = {
            id: cellId,
            value: cellValue || '',
            type: 'text'
          };
        }
      });
    });
    
    setCells(newCells);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast.success('Message sent! (This is a demo - no AI response yet)');
    setChatMessage('');
  };

  // Watch for sidebar state changes
  useEffect(() => {
    setShowSidebarToggle(!sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Sidebar Toggle Button (when sidebar is closed) */}
      {showSidebarToggle && (
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-50 h-8 w-8 p-0"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Top Navigation */}
      <header className="h-16 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
        {/* Import Data Button */}
        <div className="absolute top-20 left-4 z-20">
          <Button 
            onClick={() => setShowImportModal(true)}
            className="h-9 px-4"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        </div>
        {/* Left Section - Menus */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Upload className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileUp className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Database className="h-4 w-4 mr-2" />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                Edit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuItem>
                <Undo className="h-4 w-4 mr-2" />
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Redo className="h-4 w-4 mr-2" />
                Redo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Scissors className="h-4 w-4 mr-2" />
                Cut
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Paste
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Search className="h-4 w-4 mr-2" />
                Find & Replace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuCheckboxItem checked>
                Show row numbers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>
                Show column headers
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>
                Show grid lines
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                Presentation mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                Insert
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuItem>
                <Code2 className="h-4 w-4 mr-2" />
                Code cell
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BarChart3 className="h-4 w-4 mr-2" />
                Chart
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Table className="h-4 w-4 mr-2" />
                Table
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckSquare className="h-4 w-4 mr-2" />
                Checkbox
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Plus className="h-4 w-4 mr-2" />
                New sheet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                Format
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Hash className="h-4 w-4 mr-2" />
                  Number
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Automatic</DropdownMenuItem>
                  <DropdownMenuItem>Number</DropdownMenuItem>
                  <DropdownMenuItem>Percent</DropdownMenuItem>
                  <DropdownMenuItem>Currency</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Date</DropdownMenuItem>
                  <DropdownMenuItem>Time</DropdownMenuItem>
                  <DropdownMenuItem>Date time</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Bold className="h-4 w-4 mr-2" />
                Bold
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Italic className="h-4 w-4 mr-2" />
                Italic
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="h-4 w-4 mr-2" />
                Text color
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear formatting
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                Help
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuItem>
                <BookOpen className="h-4 w-4 mr-2" />
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calculator className="h-4 w-4 mr-2" />
                Quadratic 101
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Forum
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                External resources
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-sm">
                Feedback
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border border-border">
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Contact us
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Twitter className="h-4 w-4 mr-2" />
                Twitter/X
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Community
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Middle Section - Cell Reference & Formatting */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Input 
              value={selectedCell} 
              className="w-20 h-8 text-center text-sm"
              readOnly
            />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Hash className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Type className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <DollarSign className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Percent className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Merge className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Section - Document Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">My Team</span>
            <span className="text-sm text-muted-foreground">/</span>
            <Input 
              defaultValue="Untitled" 
              className="w-32 h-8 text-sm border-none bg-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8">
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Users className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <User className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>100%</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-80 max-w-[30vw] min-w-[280px] border-r border-border bg-card flex flex-col shrink-0">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Sheet chat</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setSidebarOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* AI Assistant Cards */}
            <div className="p-4 space-y-3">
              <div className="text-sm font-medium mb-3">What can I help with?</div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Grid3x3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Give me sample data</div>
                    <div className="text-xs text-muted-foreground">Sample data is a great way to get started with Quadratic.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Build a chart</div>
                    <div className="text-xs text-muted-foreground">Visualize your data with a chart.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Generate code</div>
                    <div className="text-xs text-muted-foreground">Use code to manipulate data, query APIs, and more.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sheet Navigation */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Sheet 1</span>
                <Badge variant="secondary" className="text-xs">Sheet</Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-auto">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Input */}
            <div className="mt-auto p-4 border-t border-border">
              <div className="space-y-3">
                <div className="relative">
                  <Input 
                    placeholder="Ask a question..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Paperclip className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Image className="h-3 w-3" />
                    </Button>
                    <Button size="sm" className="h-6 w-6 p-0">
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Model: Basic</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Resizable Question Panel */}
        <div className="flex-1 flex flex-col">
          <ResizableQuestionPanel
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            onSendMessage={handleSendMessage}
          >
            {/* Spreadsheet Grid */}
            <div className="h-full overflow-auto relative">
              <div className="relative pt-12">
                {/* Column Headers */}
                <div className="sticky top-0 z-10 flex bg-muted border-b border-border">
                  <div className="w-12 h-8 border-r border-border bg-muted"></div>
                  {columns.map((col) => (
                    <div 
                      key={col}
                      className="w-24 h-8 border-r border-border flex items-center justify-center text-sm font-medium"
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {rows.map((row) => (
                  <div key={row} className="flex border-b border-border">
                    {/* Row Header */}
                    <div className="w-12 h-8 border-r border-border bg-muted flex items-center justify-center text-sm font-medium">
                      {row}
                    </div>
                    
                    {/* Cells */}
                    {columns.map((col) => {
                      const cellId = getCellId(col, row);
                      const isSelected = selectedCell === cellId;
                      
                      return (
                        <div
                          key={cellId}
                          className={`w-24 h-8 border-r border-border relative cursor-cell ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedCell(cellId)}
                          onDoubleClick={() => setShowCellTypeModal(true)}
                        >
                          <input
                            className="w-full h-full px-2 text-sm bg-transparent border-none outline-none"
                            value={getCellValue(cellId)}
                            onChange={(e) => updateCell(cellId, e.target.value)}
                            onFocus={() => setSelectedCell(cellId)}
                          />
                          {isSelected && getCellValue(cellId) === "" && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-xs text-muted-foreground">Press / to code</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </ResizableQuestionPanel>

          {/* Sheet Tabs */}
          <div className="h-12 border-t border-border bg-card flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Sheet 1
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-blue-600">
                Sheet 1
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected</span>
                <span>0.15.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* File Import Panel */}
        <FileImport
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onDataImport={handleDataImport}
        />
      </div>

      {/* Cell Type Modal */}
      <Dialog open={showCellTypeModal} onOpenChange={setShowCellTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a cell type...</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Languages</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-mono">🐍</span>
                  </div>
                  <span className="font-medium">Python</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">fx</span>
                  </div>
                  <span className="font-medium">Formula</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-mono">JS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">JavaScript</span>
                    <Badge variant="secondary" className="text-xs">Experimental</Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Connections</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs">🔗</span>
                  </div>
                  <span className="font-medium">[Demo] Quadratic public data</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Add or manage...</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}