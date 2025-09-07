import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, PieChart, TrendingUp, ArrowLeft, Database, Brain, FileText, Loader2, RefreshCw } from 'lucide-react';
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
  const [selectedRevenueColumn, setSelectedRevenueColumn] = useState<string>('');
  const [selectedCategoryColumn, setSelectedCategoryColumn] = useState<string>('');
  const [showColumnSelection, setShowColumnSelection] = useState(false);
  const [columnTypes, setColumnTypes] = useState<{numerical: string[], categorical: string[]}>({numerical: [], categorical: []});
  const [isGeneratingCharts, setIsGeneratingCharts] = useState(false);
  const [customSelectedColumn, setCustomSelectedColumn] = useState<string>('');
  const [customChartType, setCustomChartType] = useState<'line' | 'bar' | 'pie'>('bar');
  const [isGeneratingCustomChart, setIsGeneratingCustomChart] = useState(false);

  useEffect(() => {
    if (isOpen && data.length > 0 && columns.length > 0) {
      classifyColumns();
      performAnalysis();
    }
  }, [isOpen, data, columns]);

  useEffect(() => {
    // Load cached selections
    const savedRevenue = localStorage.getItem('bi-selected-revenue-column');
    const savedCategory = localStorage.getItem('bi-selected-category-column');
    if (savedRevenue && columns.includes(savedRevenue)) {
      setSelectedRevenueColumn(savedRevenue);
    }
    if (savedCategory && columns.includes(savedCategory)) {
      setSelectedCategoryColumn(savedCategory);
    }
  }, [columns]);

  const classifyColumns = () => {
    if (data.length < 2) return;
    
    const numerical: string[] = [];
    const categorical: string[] = [];
    
    columns.forEach((col, index) => {
      const sampleValues = data.slice(1, Math.min(11, data.length)).map(row => row[index]);
      const numericCount = sampleValues.filter(val => 
        val !== null && val !== undefined && val !== '' && !isNaN(Number(val))
      ).length;
      
      if (numericCount > sampleValues.length * 0.7) {
        numerical.push(col);
      } else {
        categorical.push(col);
      }
    });
    
    setColumnTypes({ numerical, categorical });
  };

  const performAnalysis = async () => {
    const result = await analyzeData(data, columns, selectedRevenueColumn, selectedCategoryColumn);
    if (result) {
      setAnalysisResult(result);
      // Always show column selection if we have columns
      if (columnTypes.numerical.length > 0 || columnTypes.categorical.length > 0) {
        setShowColumnSelection(true);
      }
    }
  };

  const generateCustomCharts = async () => {
    if (!selectedRevenueColumn && !selectedCategoryColumn) return;
    
    setIsGeneratingCharts(true);
    try {
      const result = await analyzeData(data, columns, selectedRevenueColumn, selectedCategoryColumn);
      if (result) {
        setAnalysisResult(result);
        // Cache selections
        if (selectedRevenueColumn) {
          localStorage.setItem('bi-selected-revenue-column', selectedRevenueColumn);
        }
        if (selectedCategoryColumn) {
          localStorage.setItem('bi-selected-category-column', selectedCategoryColumn);
        }
      }
    } finally {
      setIsGeneratingCharts(false);
    }
  };

  const resetSelections = () => {
    localStorage.removeItem('bi-selected-revenue-column');
    localStorage.removeItem('bi-selected-category-column');
    setSelectedRevenueColumn('');
    setSelectedCategoryColumn('');
    setCustomSelectedColumn('');
    setCustomChartType('bar');
    performAnalysis();
  };

  const generateCustomChart = async () => {
    if (!customSelectedColumn) return;
    
    setIsGeneratingCustomChart(true);
    try {
      // Create custom chart data based on selected column and type
      const columnIndex = columns.indexOf(customSelectedColumn);
      if (columnIndex === -1) return;
      
      const columnData = data.slice(1).map(row => row[columnIndex]).filter(val => val !== null && val !== undefined && val !== '');
      
      let chartData: any[] = [];
      
      if (customChartType === 'pie') {
        // For pie charts, count occurrences of each unique value
        const counts: { [key: string]: number } = {};
        columnData.forEach(val => {
          const key = String(val);
          counts[key] = (counts[key] || 0) + 1;
        });
        chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));
      } else {
        // For line/bar charts, use value with index
        chartData = columnData.map((value, index) => ({
          name: `Point ${index + 1}`,
          value: isNaN(Number(value)) ? 0 : Number(value)
        }));
      }
      
      const customChart = {
        type: customChartType,
        data: chartData,
        title: `${customSelectedColumn} - ${customChartType.charAt(0).toUpperCase() + customChartType.slice(1)} Chart`,
        xAxis: 'name',
        yAxis: 'value'
      };
      
      // Add to existing analysis result
      if (analysisResult) {
        setAnalysisResult({
          ...analysisResult,
          charts: [...analysisResult.charts.filter((c: any) => !c.title.includes('Custom:')), 
                   { ...customChart, title: `Custom: ${customChart.title}` }]
        });
      }
    } finally {
      setIsGeneratingCustomChart(false);
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
              {/* Column Selection Interface */}
              {showColumnSelection && (
                <Card className="border-dashed border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Select Columns for Visualization
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose columns to generate dynamic charts and insights
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Revenue Column Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Revenue Trends</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select a numerical column to visualize as Revenue Trends
                        </p>
                        <Select value={selectedRevenueColumn} onValueChange={setSelectedRevenueColumn}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose numerical column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {columnTypes.numerical.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category Column Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <PieChart className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Market Share</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Select a categorical column to visualize Market Share
                        </p>
                        <Select value={selectedCategoryColumn} onValueChange={setSelectedCategoryColumn}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose categorical column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {columnTypes.categorical.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        onClick={generateCustomCharts}
                        disabled={!selectedRevenueColumn && !selectedCategoryColumn || isGeneratingCharts}
                        className="flex-1"
                      >
                        {isGeneratingCharts ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Charts...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Generate Visualizations
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetSelections}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Custom Visualization Section */}
              {showColumnSelection && (
                <Card className="border-2 border-dashed border-accent/30">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Custom Visualization
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create custom charts by selecting any column and chart type
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Select Column</h4>
                        <Select value={customSelectedColumn} onValueChange={setCustomSelectedColumn}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose any column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {columns.map((col) => (
                              <SelectItem key={col} value={col}>{col}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Chart Type</h4>
                        <Select value={customChartType} onValueChange={(value) => setCustomChartType(value as 'line' | 'bar' | 'pie')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={generateCustomChart}
                      disabled={!customSelectedColumn || isGeneratingCustomChart}
                      className="w-full"
                    >
                      {isGeneratingCustomChart ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Chart...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generate Custom Chart
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* No data available placeholder */}
              {analysisResult.charts.length === 0 && !showColumnSelection && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                          <p>No numerical data detected</p>
                          <p className="text-sm">Upload data with numerical columns</p>
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
                          <p className="text-sm">Upload data with text/category columns</p>
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