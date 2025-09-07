import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, PieChart, TrendingUp, ArrowLeft, Database, Brain, FileText, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBIAnalysis } from '@/hooks/useBIAnalysis';

interface BIDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[][];
  columns?: string[];
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088', '#8800ff', '#ff8800'];

export function BIDashboardModal({ isOpen, onClose, data = [], columns = [] }: BIDashboardModalProps) {
  const { analyzeData, loading, error } = useBIAnalysis();
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen && data.length > 0 && columns.length > 0) {
      performAnalysis();
    }
  }, [isOpen, data, columns]);

  const performAnalysis = async () => {
    const result = await analyzeData(data, columns);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const renderChart = (chart: any) => {
    const commonProps = {
      width: '100%',
      height: 200,
      data: chart.data
    };

    switch (chart.type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={chart.yAxis || 'value'} stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis || 'name'} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.yAxis || 'value'} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chart.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />;
      case 'quality': return <Database className="h-5 w-5 text-blue-500 mt-0.5" />;
      case 'action': return <FileText className="h-5 w-5 text-purple-500 mt-0.5" />;
      default: return <Brain className="h-5 w-5 text-primary mt-0.5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">BI Dashboard</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Spreadsheet
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <div className="text-center">
                <p className="text-lg font-medium">⚡ SmartBiz AI is analyzing your data</p>
                <p className="text-sm text-muted-foreground">Please wait...</p>
              </div>
            </div>
          )}

          {error && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p>Error analyzing data: {error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && data.length === 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-2" />
                  <p>No data uploaded yet</p>
                  <p className="text-sm">Upload data first to see AI-powered insights</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysisResult && !loading && (
            <>
              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analysisResult.charts.map((chart: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">{chart.title}</CardTitle>
                      {chart.type === 'pie' ? (
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        {renderChart(chart)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && analysisResult && (
            <>
              {/* Loading state for charts when no data */}
              {analysisResult.charts.length === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                          <p>No revenue data detected</p>
                          <p className="text-sm">Add revenue/sales columns for trends</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Market Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <PieChart className="h-12 w-12 mx-auto mb-2" />
                          <p>No categorical data detected</p>
                          <p className="text-sm">Add category columns for breakdown</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {!loading && analysisResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">AI-Generated Key Insights</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisResult.insights.map((insight: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      {getInsightIcon(insight.type)}
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">AI-Generated Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && analysisResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Statistical Analysis</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisResult.statistics.mean ? `$${analysisResult.statistics.mean.toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Mean Value</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {analysisResult.statistics.median ? `$${analysisResult.statistics.median.toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Median Value</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {analysisResult.statistics.stdDev ? `±${analysisResult.statistics.stdDev.toFixed(2)}` : 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">Std Deviation</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisResult.statistics.totalRecords}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </div>
                </div>
                <div className="mt-4 text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-3xl font-bold text-primary">
                    {analysisResult.qualityScore}%
                  </p>
                  <p className="text-sm text-muted-foreground">Data Quality Score</p>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-8 w-20 mx-auto mb-2" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && analysisResult && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Data Summary</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Dataset Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Rows:</span>
                        <span className="font-medium">{analysisResult.statistics.totalRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Columns:</span>
                        <span className="font-medium">{columns.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Quality:</span>
                        <span className="font-medium text-primary">{analysisResult.qualityScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Column Names</h4>
                    <div className="max-h-24 overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {columns.slice(0, 10).map((col, index) => (
                          <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                            {col}
                          </span>
                        ))}
                        {columns.length > 10 && (
                          <span className="text-xs text-muted-foreground">
                            +{columns.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}