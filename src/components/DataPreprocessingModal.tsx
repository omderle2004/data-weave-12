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
  Brain,
  Sparkles,
  FileText,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

interface DataPreprocessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  importedData?: string[][] | null;
  onDataUpdate?: (newData: string[][]) => void;
}

export function DataPreprocessingModal({ isOpen, onClose, importedData, onDataUpdate }: DataPreprocessingModalProps) {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [cleaningSummary, setCleaningSummary] = useState<any>(null);

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
    setCleaningSummary(null);
  };

  const analyzeData = (data: string[][]) => {
    if (!data || data.length === 0) return;

    const issues = {
      missingValues: 0,
      duplicateRows: 0,
      dataTypeIssues: 0,
      inconsistentFormats: 0
    };

    const seenRows = new Set();
    let totalCells = 0;
    let goodCells = 0;

    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        totalCells++;
        
        // Check for missing values
        if (!cell || cell.trim() === '' || cell.toLowerCase() === 'null' || cell.toLowerCase() === 'n/a') {
          issues.missingValues++;
        } else {
          goodCells++;
        }

        // Check for date format inconsistencies
        if (rowIndex > 0 && cell && cell.includes('/') && cell.includes('-')) {
          issues.inconsistentFormats++;
        }
      });

      // Check for duplicates
      const rowString = row.join('|');
      if (seenRows.has(rowString) && rowIndex > 0) { // Don't count header as duplicate
        issues.duplicateRows++;
      } else {
        seenRows.add(rowString);
      }
    });

    setAnalysisResults(issues);
    setQualityScore(Math.round((goodCells / totalCells) * 100));
  };

  const handleAIDataCleaning = async () => {
    if (!importedData || !hasData) {
      toast.error('No data available to clean');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('clean-data-with-ai', {
        body: {
          data: importedData,
          projectId: projectId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (result.success) {
        setCleaningSummary(result.summary);
        setQualityScore(result.qualityScore);
        
        // Update the data in parent component
        if (onDataUpdate && result.cleanedData) {
          onDataUpdate(result.cleanedData);
        }

        // Re-analyze the cleaned data
        analyzeData(result.cleanedData);
        
        toast.success(`Data cleaned successfully! ${result.summary.rowsRemoved} rows removed, ${result.summary.valuesFilled} values filled.`);
      } else {
        throw new Error(result.error || 'Failed to clean data');
      }
    } catch (error) {
      console.error('Error cleaning data:', error);
      toast.error(`Failed to clean data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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

    if (analysisResults.inconsistentFormats > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Data Type Issues',
        description: `${analysisResults.inconsistentFormats} cells with inconsistent date formats detected`,
        severity: 'medium',
        count: analysisResults.inconsistentFormats
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
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-destructive/10 rounded-lg">
                     <XCircle className="h-5 w-5 text-destructive" />
                   </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {hasData && analysisResults ? 
                        (analysisResults.duplicateRows > 0 ? analysisResults.duplicateRows : 0) : 
                        0}
                    </p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-warning/10 rounded-lg">
                     <AlertTriangle className="h-5 w-5 text-warning" />
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
                   <div className="p-2 bg-success/10 rounded-lg">
                     <CheckCircle className="h-5 w-5 text-success" />
                   </div>
                  <div>
                    <p className="text-2xl font-bold">{qualityScore}%</p>
                    <p className="text-sm text-muted-foreground">Data Quality Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Show cleaning summary if available */}
           {cleaningSummary && (
             <Card className="bg-success/5 border-success/20">
               <CardContent className="p-4">
                 <div className="flex items-center gap-3 mb-3">
                   <CheckCircle className="h-5 w-5 text-success" />
                   <h4 className="font-medium text-success">Data Cleaning Complete</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-4 text-sm">
                   <div className="text-center">
                     <p className="font-semibold text-success">{cleaningSummary.rowsRemoved}</p>
                     <p className="text-success/80">Rows Removed</p>
                   </div>
                   <div className="text-center">
                     <p className="font-semibold text-success">{cleaningSummary.valuesFilled}</p>
                     <p className="text-success/80">Values Filled</p>
                   </div>
                   <div className="text-center">
                     <p className="font-semibold text-success">{cleaningSummary.formatsStandardized || 0}</p>
                     <p className="text-success/80">Formats Fixed</p>
                   </div>
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

          {/* AI-Powered Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-medium">AI-Powered Data Cleaning</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                   <div className="flex items-center gap-3 mb-3">
                     <Sparkles className="h-5 w-5 text-primary" />
                     <h4 className="font-medium">Smart Data Cleaning</h4>
                   </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI will automatically fix common data issues including missing values, duplicates, and format inconsistencies.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleAIDataCleaning}
                    disabled={!hasData || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Fix Data with AI
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Generate Report</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Export detailed data quality report</p>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">View Statistics</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Analyze data distribution patterns</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}