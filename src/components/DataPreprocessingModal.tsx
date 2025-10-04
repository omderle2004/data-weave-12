import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Database,
  Wand2,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AIFixOptionsPanel } from './AIFixOptionsPanel';

interface DataPreprocessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  importedData?: string[][] | null;
  onDataUpdate?: (newData: string[][]) => void;
}

export function DataPreprocessingModal({ isOpen, onClose, importedData, onDataUpdate }: DataPreprocessingModalProps) {
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [isFixingData, setIsFixingData] = useState(false);
  const [dataTypeIssueDetails, setDataTypeIssueDetails] = useState<string[]>([]);
  const [showAIFixPanel, setShowAIFixPanel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (importedData && importedData.length > 0) {
        setHasData(true);
        analyzeData(importedData);
      } else {
        setHasData(false);
        resetAnalysis();
      }
    }
  }, [isOpen, importedData]);

  const resetAnalysis = () => {
    setAnalysisResults(null);
    setQualityScore(0);
  };

  const analyzeData = (data: any[][]) => {
    try {
      if (!data || data.length === 0) return;

      const issues = {
        missingValues: 0,
        duplicateRows: 0,
        dataTypeIssues: 0,
        inconsistentFormats: 0,
      };

      const seenRows = new Set<string>();
      let totalCells = 0;
      let goodCells = 0;

      // Helper: normalize value for comparisons
      const normalize = (v: any) => {
        if (v === null || v === undefined) return '';
        if (typeof v === 'string') return v.trim().toLowerCase();
        if (typeof v === 'number' && Number.isNaN(v)) return '';
        return String(v).trim().toLowerCase();
      };

      // Helper: detect data type of a value
      const detectType = (v: any): 'empty' | 'number' | 'date' | 'boolean' | 'string' => {
        if (v === null || v === undefined) return 'empty';
        if (typeof v === 'number') return Number.isNaN(v) ? 'empty' : 'number';
        if (typeof v === 'boolean') return 'boolean';
        if (v instanceof Date) return 'date';
        const s = typeof v === 'string' ? v.trim() : String(v).trim();
        if (s === '') return 'empty';
        const sLower = s.toLowerCase();
        if (sLower === 'null' || sLower === 'n/a' || sLower === 'na' || sLower === 'nan') return 'empty';
        // numeric-like string
        if (/^[-+]?\d*(?:\.\d+)?$/.test(s) && s.replace(/[+\-]/g, '') !== '') return 'number';
        // date-like string
        const parsed = Date.parse(s);
        if (!Number.isNaN(parsed)) return 'date';
        return 'string';
      };

      // Track column type diversity (skip header row at index 0)
      const colTypeSets: Array<Set<string>> = [];
      const columnNames = data[0] || [];
      const problematicColumns: string[] = [];

      data.forEach((row, rowIndex) => {
        // Count duplicates (normalize all cells)
        const rowString = (row || []).map((cell) => normalize(cell)).join('|');
        if (seenRows.has(rowString) && rowIndex > 0) {
          issues.duplicateRows++;
        } else {
          seenRows.add(rowString);
        }

        (row || []).forEach((cell, colIndex) => {
          totalCells++;

          // Missing values handling (robust across types)
          const isMissing = (() => {
            if (cell === null || cell === undefined) return true;
            if (typeof cell === 'number') return Number.isNaN(cell);
            const s = typeof cell === 'string' ? cell : String(cell);
            const sTrim = s.trim();
            if (sTrim === '') return true;
            const sLower = sTrim.toLowerCase();
            return sLower === 'null' || sLower === 'n/a' || sLower === 'na' || sLower === 'nan';
          })();

          if (isMissing) {
            issues.missingValues++;
          } else {
            goodCells++;
          }

          // Build column type sets for data type issues (skip header row)
          if (rowIndex > 0) {
            if (!colTypeSets[colIndex]) colTypeSets[colIndex] = new Set<string>();
            const t = detectType(cell);
            if (t !== 'empty') colTypeSets[colIndex].add(t);
          }
        });
      });

      // Count columns with mixed types as data type issues
      colTypeSets.forEach((set, colIndex) => {
        if (set && set.size > 1) {
          issues.dataTypeIssues++;
          if (columnNames[colIndex]) {
            problematicColumns.push(columnNames[colIndex]);
          }
        }
      });

      setDataTypeIssueDetails(problematicColumns);

      setAnalysisResults(issues);
      const score = totalCells > 0 ? Math.round((goodCells / totalCells) * 100) : 0;
      setQualityScore(score);
    } catch (err) {
      console.error('Data analysis failed:', err);
      setAnalysisResults({ missingValues: 0, duplicateRows: 0, dataTypeIssues: 0, inconsistentFormats: 0 });
      setQualityScore(0);
    }
  };

  const handleFixWithAI = () => {
    if (!importedData || !analysisResults) {
      toast.error('No data available to fix');
      return;
    }

    // Check if data is already perfect
    const hasIssues = analysisResults.missingValues > 0 || 
                     analysisResults.duplicateRows > 0 || 
                     analysisResults.dataTypeIssues > 0;

    if (!hasIssues) {
      toast.success('Your data is ready to go, Enjoy Analysis! 🎉');
      return;
    }

    // Open the AI Fix Options Panel
    setShowAIFixPanel(true);
  };

  const getDataInsights = () => {
    if (!hasData || !analysisResults) {
      return [{
        type: 'info',
        icon: Database,
        title: 'No Data Available',
        description: 'Please upload your data to get insights.',
        severity: 'low',
        count: 0
      }];
    }

    const insights = [];

    if (analysisResults.missingValues > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Missing Values',
        description: `${analysisResults.missingValues} null or empty values detected`,
        severity: 'medium',
        count: analysisResults.missingValues
      });
    }

    if (analysisResults.duplicateRows > 0) {
      insights.push({
        type: 'error',
        icon: XCircle,
        title: 'Duplicate Records',
        description: `${analysisResults.duplicateRows} duplicate rows found`,
        severity: 'high',
        count: analysisResults.duplicateRows
      });
    }

    if (analysisResults.dataTypeIssues > 0) {
      const detailText = dataTypeIssueDetails.length > 0 
        ? `Affected columns: ${dataTypeIssueDetails.join(', ')}` 
        : `${analysisResults.dataTypeIssues} columns contain mixed or invalid data types`;
      
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Data Type Issues',
        description: detailText,
        severity: 'medium',
        count: analysisResults.dataTypeIssues
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Data Quality Good',
        description: 'No major data quality issues detected',
        severity: 'low',
        count: 0
      });
    }

    return insights;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-xl font-semibold">Data Preprocessing & Quality Analysis</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Analysis
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto space-y-6">
            {/* Data Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-orange-100 rounded-lg">
                       <AlertTriangle className="h-5 w-5 text-orange-600" />
                     </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {hasData && analysisResults ? analysisResults.missingValues : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Missing Values</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-red-100 rounded-lg">
                       <XCircle className="h-5 w-5 text-red-600" />
                     </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {hasData && analysisResults ? analysisResults.duplicateRows : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Duplicate Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-yellow-100 rounded-lg">
                       <AlertTriangle className="h-5 w-5 text-yellow-600" />
                     </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {hasData && analysisResults ? analysisResults.dataTypeIssues : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Data Type Issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-green-100 rounded-lg">
                       <CheckCircle className="h-5 w-5 text-green-600" />
                     </div>
                    <div>
                      <p className="text-2xl font-bold">{qualityScore}%</p>
                      <p className="text-sm text-muted-foreground">Data Quality Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* AI Fix Section - Always visible */}
            {hasData && analysisResults && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Wand2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">AI-Powered Data Cleaning</h3>
                        <p className="text-sm text-blue-700">
                          {(analysisResults.missingValues > 0 || analysisResults.duplicateRows > 0 || analysisResults.dataTypeIssues > 0)
                            ? "Let our AI automatically fix data quality issues"
                            : "Your data looks great! Click to confirm quality"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleFixWithAI}
                      disabled={isFixingData || (analysisResults.missingValues === 0 && analysisResults.duplicateRows === 0 && analysisResults.dataTypeIssues === 0)}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isFixingData ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fixing Data...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Fix with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Data Insights */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium">Data Quality Insights</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getDataInsights().map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <insight.icon className={`h-5 w-5 mt-0.5 ${getSeverityColor(insight.severity)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant={getSeverityBadge(insight.severity) as any} className="h-5 text-xs">
                            {insight.severity}
                          </Badge>
                          {insight.count > 0 && (
                            <Badge variant="outline" className="h-5 text-xs">
                              {insight.count} issues
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </DialogContent>
      </Dialog>

      {/* AI Fix Options Panel */}
      <AIFixOptionsPanel 
        isOpen={showAIFixPanel} 
        onBack={() => setShowAIFixPanel(false)} 
      />
    </>
  );
}