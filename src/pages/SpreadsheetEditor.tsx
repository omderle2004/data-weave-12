import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
  Github, Twitter, Mail, Database, Upload, FileUp, Link, Code,
  Activity
} from "lucide-react";
import { FileImport } from "@/components/FileImport";
import { ResizableQuestionPanel } from "@/components/ResizableQuestionPanel";
import { BIDashboardModal } from "@/components/BIDashboardModal";
import { DataPreprocessingModal } from "@/components/DataPreprocessingModal";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateAnalysisReport } from '@/utils/generateAnalysisReport';
import { generatePDFBase64 } from '@/utils/generatePDFBase64';
import { EmailShareDialog } from '@/components/EmailShareDialog';
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

interface AIResponse {
  id: string;
  type: 'text' | 'code' | 'chart' | 'image' | 'table';
  content: string;
  timestamp: Date;
  chartData?: any[];
  chartType?: string;
  chartTitle?: string;
  insights?: string[];
  statistics?: any;
  tableData?: {
    title: string;
    columns: string[];
    rows: string[][];
  };
  intent?: string;
}

interface QuestionResponsePair {
  question: string;
  response: AIResponse;
}

export default function SpreadsheetEditor() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const [selectedCell, setSelectedCell] = useState<string>("A1");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCellTypeModal, setShowCellTypeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [importedData, setImportedData] = useState<string[][] | null>(null);
  const [showSidebarToggle, setShowSidebarToggle] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(projectId || null);
  const [projectName, setProjectName] = useState<string>("Untitled");
  const [activeView, setActiveView] = useState<'analyze' | 'dashboard'>('analyze');
  const [showBIDashboard, setShowBIDashboard] = useState(false);
  const [showDataPreprocessing, setShowDataPreprocessing] = useState(false);
  const [questionResponsePairs, setQuestionResponsePairs] = useState<QuestionResponsePair[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Load project data if projectId exists
  useEffect(() => {
    const loadProject = async () => {
      if (projectId && user) {
        try {
          setLoadingAnalysis(true);
          const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error loading project:', error);
            toast.error('Failed to load project');
            navigate('/dashboard');
            return;
          }

          if (project && project.spreadsheet_data) {
            setProjectName(project.name);
            handleDataImport(project.spreadsheet_data, project.id);
          }

          // Load saved analysis results
          const { data: analysisData, error: analysisError } = await supabase
            .from('analysis_results')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

          if (analysisError) {
            console.error('Error loading analysis results:', analysisError);
            toast.error('Failed to load previous analysis');
          } else if (analysisData && analysisData.length > 0) {
            const loadedPairs: QuestionResponsePair[] = analysisData.map((item: any) => ({
              question: item.question,
              response: {
                ...item.response_data,
                timestamp: new Date(item.response_data.timestamp)
              }
            }));
            setQuestionResponsePairs(loadedPairs);
            toast.success(`Loaded ${loadedPairs.length} previous analysis`);
          }
        } catch (error) {
          console.error('Error loading project:', error);
          toast.error('Failed to load project');
          navigate('/dashboard');
        } finally {
          setLoadingAnalysis(false);
        }
      } else {
        // Check URL params to auto-open import modal for new projects
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'import') {
          setShowImportModal(true);
        }
      }
    };

    loadProject();
  }, [projectId, user, navigate]);

  // Generate dynamic grid data based on imported data or defaults
  const getDynamicGridSize = () => {
    if (importedData) {
      // Show ALL data - no limits at all
      const maxCols = Math.max(...importedData.map(row => row.length));
      const maxRows = importedData.length;
      return {
        columns: Math.max(26, maxCols), // At least 26 columns (A-Z), but show all if more
        rows: Math.max(50, maxRows) // At least 50 rows, but show all if more
      };
    }
    return { columns: 26, rows: 50 }; // Default size
  };

  const { columns: colCount, rows: rowCount } = getDynamicGridSize();
  const columns = Array.from({ length: colCount }, (_, i) => {
    if (i < 26) return String.fromCharCode(65 + i);
    // Handle beyond Z (AA, AB, AC, etc.)
    const firstChar = String.fromCharCode(65 + Math.floor(i / 26) - 1);
    const secondChar = String.fromCharCode(65 + (i % 26));
    return firstChar + secondChar;
  });
  const rows = Array.from({ length: rowCount }, (_, i) => i + 1);

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

  const handleDataImport = (data: string[][], newProjectId?: string) => {
    setImportedData(data);
    const newCells: Record<string, Cell> = {};
    
    data.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        // No limits - populate all cells from imported data
        const colLetter = colIndex < 26 
          ? String.fromCharCode(65 + colIndex)
          : String.fromCharCode(65 + Math.floor(colIndex / 26) - 1) + String.fromCharCode(65 + (colIndex % 26));
        
        const cellId = getCellId(colLetter, rowIndex + 1);
        newCells[cellId] = {
          id: cellId,
          value: cellValue || '',
          type: 'text'
        };
      });
    });
    
    setCells(newCells);
    
    if (newProjectId) {
      setCurrentProjectId(newProjectId);
      // Navigate to the project-specific URL
      navigate(`/spreadsheet/${newProjectId}`, { replace: true });
    }
    
    setUploadComplete(true);
    
    // Auto-close after showing completion
    setTimeout(() => {
      setShowImportModal(false);
      setUploadComplete(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    toast.success('SmartBiz Response successfully');
    setChatMessage('');
  };

  // Watch for sidebar state changes
  useEffect(() => {
    setShowSidebarToggle(!sidebarOpen);
  }, [sidebarOpen]);

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-background overflow-hidden w-full">
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
      <header className="h-12 lg:h-16 border-b border-border bg-card px-2 lg:px-4 flex items-center justify-between shrink-0 overflow-x-auto">
        {/* Import Data Button */}
        <div className="absolute top-14 lg:top-20 left-2 lg:left-4 z-20">
          <Button 
            onClick={() => setShowImportModal(true)}
            className="h-8 lg:h-9 px-3 lg:px-4 text-xs lg:text-sm"
            variant="outline"
          >
            <Upload className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            Import Data
          </Button>
        </div>
        {/* Left Section - Back Button & Menus */}
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-1 mr-2 lg:mr-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 lg:h-8 px-1 lg:px-2 mr-1 lg:mr-2"
              onClick={() => navigate("/")}
            >
              <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              <span className="text-xs lg:text-sm">Back</span>
            </Button>
            <img 
              src="/lovable-uploads/f8953591-fc49-4dd1-9fdf-6d69cf74426b.png" 
              alt="SmartBiz AI Logo" 
              className="w-5 h-5 lg:w-6 lg:h-6 rounded object-contain shrink-0"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm">
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
                <Button variant="ghost" size="sm" className="h-6 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm">
                  Edit
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border z-50">
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
                <Button variant="ghost" size="sm" className="h-6 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm">
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border z-50">
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

            {/* Grouped menu for secondary actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 lg:h-8 px-2 lg:px-3 text-xs lg:text-sm">
                  More
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border z-50">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Plus className="h-4 w-4 mr-2" />
                    Insert
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
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
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="h-4 w-4 mr-2" />
                    Format
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
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
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Help & Documentation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Middle Section - Cell Reference & Formatting (Hidden on small screens) */}
        <div className="hidden xl:flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1">
            <Input 
              value={selectedCell} 
              className="w-16 h-6 text-center text-xs"
              readOnly
            />
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Hash className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Type className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <DollarSign className="h-3 w-3" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-4" />
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Bold className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Italic className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Underline className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Right Section - Document Controls */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs lg:text-sm text-muted-foreground">My Team</span>
            <span className="text-xs lg:text-sm text-muted-foreground">/</span>
            <Input 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-24 lg:w-32 h-6 lg:h-8 text-xs lg:text-sm border-none bg-transparent"
            />
          </div>
          
          <div className="flex items-center gap-1 lg:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-6 lg:h-8 text-xs lg:text-sm px-2 lg:px-3">
                  <Share className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border z-50">
                <DropdownMenuItem onClick={async () => {
                  const loadingToast = toast.loading('Capturing charts and generating PDF report...');
                  try {
                    // Wait a bit for charts to render if just loaded
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await generateAnalysisReport(projectName, questionResponsePairs);
                    toast.success('Report downloaded successfully!', { id: loadingToast });
                  } catch (error) {
                    console.error('Error generating report:', error);
                    toast.error('Failed to generate report', { id: loadingToast });
                  }
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Analysis Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEmailDialog(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="h-6 w-6 lg:h-8 lg:w-8 p-0">
              <Users className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 lg:h-8 lg:w-8 p-0">
              <User className="h-3 w-3 lg:h-4 lg:w-4" />
            </Button>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <span>100%</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-success rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="w-72 lg:w-80 max-w-[30vw] min-w-[250px] lg:min-w-[280px] border-r border-border bg-card flex flex-col shrink-0">
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

            {/* Navigation Buttons */}
            <div className="p-4 space-y-3">
              <div className="text-sm font-medium mb-3">SmartBiz AI</div>
              
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={activeView === 'analyze' ? 'default' : 'outline'}
                      className="w-full justify-start h-12"
                      onClick={() => setActiveView('analyze')}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Analyze Your Data
                      <ChevronDown className="h-3 w-3 ml-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border border-border z-50 w-56">
                    <DropdownMenuItem 
                      onClick={() => setShowDataPreprocessing(true)}
                      className="cursor-pointer"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Data PreProcessing
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant={activeView === 'dashboard' ? 'default' : 'outline'}
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setActiveView('dashboard');
                    setShowBIDashboard(true);
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  BI Dashboard
                </Button>
              </div>
            </div>

            {/* AI Assistant Cards - Only show when in analyze view */}
            {activeView === 'analyze' && (
              <div className="p-4 space-y-3 border-t border-border">
                <div className="text-sm font-medium mb-3">What can I help with?</div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Grid3x3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Give me sample data</div>
                      <div className="text-xs text-muted-foreground">Sample data is a great way to get started with SmartBiz AI.</div>
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
            )}

            {/* Sheet Navigation */}
            <div className="p-4 border-t border-border mt-auto">
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

          </div>
        )}

        {/* Main Content with Resizable Question Panel */}
        <div className="flex-1 flex flex-col">
          <ResizableQuestionPanel
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            onSendMessage={handleSendMessage}
            data={importedData || []}
            columns={importedData && importedData.length > 0 ? importedData[0].map((header, index) => header?.toString() || `Column ${index + 1}`) : []}
            loadingAnalysis={loadingAnalysis}
            previousResponses={questionResponsePairs.map(pair => pair.response)}
            onQuestionResponse={async (question, response) => {
              // If question is provided, this is a new response or chart update with question
              if (question) {
                // Check if this is updating an existing response (chart image added)
                const existingPairIndex = questionResponsePairs.findIndex(
                  pair => pair.response.id === response.id
                );
                
                if (existingPairIndex !== -1) {
                  // Update existing response
                  setQuestionResponsePairs(prev => 
                    prev.map((pair, idx) => 
                      idx === existingPairIndex 
                        ? { ...pair, response }
                        : pair
                    )
                  );
                  
                  // Update in database
                  if (projectId && user) {
                    try {
                      const { data: existingRecords } = await supabase
                        .from('analysis_results')
                        .select('*')
                        .eq('project_id', projectId)
                        .eq('user_id', user.id)
                        .eq('question', question);
                      
                      if (existingRecords && existingRecords.length > 0) {
                        await supabase
                          .from('analysis_results')
                          .update({
                            response_data: {
                              ...response,
                              timestamp: response.timestamp.toISOString()
                            }
                          })
                          .eq('id', existingRecords[0].id);
                      }
                    } catch (error) {
                      console.error('Error updating chart image:', error);
                    }
                  }
                } else {
                  // New question-response pair
                  const newPair = { question, response };
                  setQuestionResponsePairs(prev => [...prev, newPair]);

                  // Save to database
                  if (projectId && user) {
                    try {
                      await supabase.from('analysis_results').insert({
                        project_id: projectId,
                        user_id: user.id,
                        question: question,
                        response_data: {
                          ...response,
                          timestamp: response.timestamp.toISOString()
                        }
                      });
                    } catch (error) {
                      console.error('Error saving analysis result:', error);
                    }
                  }
                }
              }
            }}
          >
            {/* Spreadsheet Grid */}
            <div className="h-full overflow-auto relative bg-background">
              <div className="relative min-w-max">
                {/* Column Headers */}
                <div className="sticky top-0 z-10 flex bg-muted border-b border-border">
                  <div className="w-12 h-8 border-r border-border bg-muted shrink-0"></div>
                  {columns.map((col) => (
                    <div 
                      key={col}
                      className="w-24 h-8 border-r border-border flex items-center justify-center text-sm font-medium shrink-0"
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {rows.map((row) => (
                  <div key={row} className="flex border-b border-border">
                    {/* Row Header */}
                    <div className="w-12 h-8 border-r border-border bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {row}
                    </div>
                    
                    {/* Cells */}
                    {columns.map((col) => {
                      const cellId = getCellId(col, row);
                      const isSelected = selectedCell === cellId;
                      
                      return (
                        <div
                          key={cellId}
                          className={`w-24 h-8 border-r border-border relative cursor-cell shrink-0 ${
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
        {showImportModal && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <FileImport
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onDataImport={handleDataImport}
                uploadComplete={uploadComplete}
              />
            </div>
          </div>
        )}
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
                  <span className="font-medium">[Demo] SmartBiz AI public data</span>
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

      {/* BI Dashboard Modal */}
      <BIDashboardModal 
        isOpen={showBIDashboard} 
        onClose={() => {
          setShowBIDashboard(false);
          setActiveView('analyze');
        }}
        data={importedData || []}
        columns={importedData && importedData.length > 0 ? importedData[0].map((header, index) => header?.toString() || `Column ${index + 1}`) : []}
      />

      {/* Data Preprocessing Modal */}
      <DataPreprocessingModal 
        isOpen={showDataPreprocessing} 
        onClose={() => setShowDataPreprocessing(false)}
        importedData={importedData}
        projectId={currentProjectId || undefined}
        onDataUpdate={async (newData) => {
          // Update UI immediately
          handleDataImport(newData, currentProjectId || undefined);
          
          // Save to database permanently
          if (currentProjectId) {
            try {
              const { error } = await supabase
                .from('projects')
                .update({ 
                  spreadsheet_data: newData,
                  updated_at: new Date().toISOString()
                })
                .eq('id', currentProjectId);

              if (error) {
                console.error('Error saving cleaned data:', error);
                toast.error('Failed to save cleaned data permanently');
              } else {
                toast.success('Data saved permanently');
              }
            } catch (error) {
              console.error('Error saving cleaned data:', error);
              toast.error('Failed to save cleaned data');
            }
          }
        }}
      />

      <EmailShareDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        userEmail={user?.email || ''}
        isSending={isSendingEmail}
        onSend={async (recipientEmail) => {
          setIsSendingEmail(true);
          const loadingToast = toast.loading('Preparing and sending report...');
          
          try {
            const hasAnalysis = questionResponsePairs.length > 0;
            let pdfBase64: string | undefined;

            // Generate PDF if analysis exists
            if (hasAnalysis) {
              // Wait for charts to render
              await new Promise(resolve => setTimeout(resolve, 1000));
              pdfBase64 = await generatePDFBase64(projectName, questionResponsePairs);
            }

            // Call edge function to send email
            const { data, error } = await supabase.functions.invoke('send-analysis-report', {
              body: {
                recipientEmail,
                projectName,
                pdfBase64,
                hasAnalysis,
              }
            });

            if (error) throw error;

            toast.success('Your report has been sent successfully.', { id: loadingToast });
            setShowEmailDialog(false);
          } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send report', { id: loadingToast });
          } finally {
            setIsSendingEmail(false);
          }
        }}
      />
    </div>
    </ProtectedRoute>
  );
}