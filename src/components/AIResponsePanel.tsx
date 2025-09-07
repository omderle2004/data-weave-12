import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Code, BarChart3, FileText, Image, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface AIResponsePanelProps {
  responses: AIResponse[];
  isLoading?: boolean;
}

export function AIResponsePanel({ responses, isLoading = false }: AIResponsePanelProps) {
  const getResponseIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code className="h-4 w-4" />;
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'table': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'chart': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'image': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'table': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">AI Response</h3>
          {isLoading && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          AI analysis and responses appear here
        </p>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1 p-4">
        {responses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No responses yet</p>
            <p className="text-xs mt-1">Ask a question to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <Card key={response.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`${getResponseTypeColor(response.type)} flex items-center gap-1`}
                    >
                      {getResponseIcon(response.type)}
                      {response.type}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm whitespace-pre-wrap break-words mb-3">
                      {response.content}
                    </div>
                    
                    {/* Display insights if available */}
                    {response.insights && response.insights.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-2">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Key Insights</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {response.insights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Display table if available */}
                    {response.tableData && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-primary mb-2">{response.tableData.title}</div>
                        <div className="border border-border rounded-md overflow-hidden">
                          <div className="overflow-x-auto max-h-64">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-muted">
                                  {response.tableData.columns.map((col, idx) => (
                                    <th key={idx} className="px-2 py-1 text-left font-medium text-muted-foreground border-r border-border last:border-r-0">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {response.tableData.rows.map((row, rowIdx) => (
                                  <tr key={rowIdx} className="border-t border-border hover:bg-muted/50">
                                    {row.map((cell, cellIdx) => (
                                      <td key={cellIdx} className="px-2 py-1 border-r border-border last:border-r-0">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Display chart if available */}
                    {response.chartData && response.chartType && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-primary mb-2">{response.chartTitle}</div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            {response.chartType === 'bar' ? (
                              <BarChart data={response.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="hsl(var(--primary))" />
                              </BarChart>
                            ) : response.chartType === 'line' || response.chartType === 'area' ? (
                              <LineChart data={response.chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                              </LineChart>
                            ) : response.chartType === 'pie' ? (
                              <PieChart>
                                <Pie
                                  data={response.chartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {response.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            ) : null}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Display statistics if available */}
                    {response.statistics && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-2">
                          <Info className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Statistics</span>
                        </div>
                        <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                          {Object.entries(response.statistics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {response.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground p-4 border-t border-border">
        <span>Responses: {responses.length}</span>
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          AI Ready
        </span>
      </div>
    </div>
  );
}