import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bot, Code, BarChart3, FileText, Image, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

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
  recommendations?: string[];
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
          <h3 className="font-semibold text-sm">SmartBiz Output – Your Virtual Analyst</h3>
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
                          <ScrollArea className="max-h-64">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-muted">
                                    {response.tableData.columns.map((col, idx) => (
                                      <th key={idx} className="px-2 py-1 text-left font-medium text-muted-foreground border-r border-border last:border-r-0 whitespace-nowrap">
                                        {col}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {response.tableData.rows.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="border-t border-border hover:bg-muted/50">
                                      {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="px-2 py-1 border-r border-border last:border-r-0 whitespace-nowrap">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    )}

                    {/* Display chart if available - Enhanced with colors, legends, and interactivity */}
                    {response.chartData && response.chartType && (
                      <div className="mb-3 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-3 rounded-lg border border-blue-100">
                        <div className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          {response.chartTitle}
                        </div>
                        <ScrollArea className="h-80 w-full">
                          <div className="min-w-full h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              {response.chartType === 'bar' ? (
                                <BarChart data={response.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                  <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.9}/>
                                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--card))', 
                                      border: '2px solid hsl(217, 91%, 60%)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                                  />
                                  <Legend 
                                    wrapperStyle={{ paddingTop: '10px' }}
                                    iconType="circle"
                                  />
                                  <Bar 
                                    dataKey="value" 
                                    fill="url(#colorBar)" 
                                    radius={[8, 8, 0, 0]}
                                    name="Value"
                                  />
                                </BarChart>
                              ) : response.chartType === 'line' ? (
                                <LineChart data={response.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                  <defs>
                                    <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--card))', 
                                      border: '2px solid hsl(142, 76%, 36%)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                    cursor={{ strokeDasharray: '3 3' }}
                                  />
                                  <Legend 
                                    wrapperStyle={{ paddingTop: '10px' }}
                                    iconType="circle"
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="hsl(142, 76%, 36%)" 
                                    strokeWidth={3}
                                    dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 5, fillOpacity: 1 }}
                                    activeDot={{ r: 8, fill: 'hsl(142, 76%, 36%)', stroke: 'white', strokeWidth: 2 }}
                                    name="Value"
                                  />
                                </LineChart>
                              ) : response.chartType === 'area' ? (
                                <AreaChart data={response.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                  <defs>
                                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="hsl(271, 81%, 56%)" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="hsl(271, 81%, 56%)" stopOpacity={0.1}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.15)" />
                                  <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                  />
                                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--card))', 
                                      border: '2px solid hsl(271, 81%, 56%)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                  />
                                  <Legend 
                                    wrapperStyle={{ paddingTop: '10px' }}
                                    iconType="circle"
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="hsl(271, 81%, 56%)" 
                                    strokeWidth={3}
                                    fill="url(#colorArea)"
                                    name="Value"
                                  />
                                </AreaChart>
                              ) : response.chartType === 'pie' ? (
                                <PieChart>
                                  <Pie
                                    data={response.chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={{
                                      stroke: 'hsl(var(--foreground))',
                                      strokeWidth: 1
                                    }}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    stroke="hsl(var(--background))"
                                    strokeWidth={2}
                                  >
                                    {response.chartData.map((entry, index) => {
                                      const vibrantColors = [
                                        'hsl(217, 91%, 60%)',  // Vibrant blue
                                        'hsl(142, 76%, 36%)',  // Vibrant green
                                        'hsl(25, 95%, 53%)',   // Vibrant orange
                                        'hsl(271, 81%, 56%)',  // Vibrant purple
                                        'hsl(347, 77%, 50%)',  // Vibrant red
                                        'hsl(43, 96%, 56%)',   // Vibrant yellow
                                        'hsl(197, 71%, 52%)',  // Vibrant cyan
                                        'hsl(340, 82%, 52%)',  // Vibrant pink
                                        'hsl(162, 63%, 41%)',  // Vibrant teal
                                        'hsl(24, 100%, 50%)'   // Vibrant deep orange
                                      ];
                                      return (
                                        <Cell 
                                          key={`cell-${index}`} 
                                          fill={vibrantColors[index % vibrantColors.length]}
                                          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                                        />
                                      );
                                    })}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'hsl(var(--card))', 
                                      border: '2px solid hsl(217, 91%, 60%)',
                                      borderRadius: '8px',
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }} 
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    iconType="circle"
                                  />
                                </PieChart>
                              ) : null}
                            </ResponsiveContainer>
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Display recommendations if available */}
                    {response.recommendations && response.recommendations.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-2">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Recommendations</span>
                        </div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {response.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-green-600">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
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