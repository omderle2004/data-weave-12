import React from 'react';
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
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DataPreprocessingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataPreprocessingModal({ isOpen, onClose }: DataPreprocessingModalProps) {
  const dataInsights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Missing Values',
      description: '12 null values detected in Customer Name column',
      severity: 'medium',
      count: 12
    },
    {
      type: 'error',
      icon: XCircle,
      title: 'Duplicate Records',
      description: '3 duplicate entries found (Order IDs: ORD1002, ORD1005, ORD1008)',
      severity: 'high',
      count: 3
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Data Type Issues',
      description: 'Date column contains inconsistent formats (MM/DD/YYYY vs DD-MM-YYYY)',
      severity: 'medium',
      count: 8
    },
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Complete Data',
      description: 'Price and Quantity columns are 100% complete',
      severity: 'low',
      count: 0
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
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
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Critical Issues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">20</p>
                    <p className="text-sm text-muted-foreground">Missing Values</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-sm text-muted-foreground">Data Quality Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Data Insights */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-medium">Data Quality Insights</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataInsights.map((insight, index) => (
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
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <h4 className="font-medium">Smart Data Cleaning</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI will automatically fix common data issues including missing values, duplicates, and format inconsistencies.
                  </p>
                  <Button className="w-full" onClick={() => alert('AI data cleaning initiated!')}>
                    <Brain className="h-4 w-4 mr-2" />
                    Fix Data with AI
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