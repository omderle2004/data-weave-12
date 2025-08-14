import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, PieChart, LineChart, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIAnalysisPanelProps {
  data: Record<string, string>;
}

interface AnalysisResult {
  analysis: string;
  suggested_charts: Array<{
    type: string;
    title: string;
    description: string;
    data_columns: string[];
  }>;
  insights: string[];
}

export function AIAnalysisPanel({ data }: AIAnalysisPanelProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('ai-analyze-data', {
        body: { query, data }
      });

      if (error) throw error;
      
      setResult(response);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze data');
    } finally {
      setLoading(false);
    }
  };

  const getChartIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'line': return <LineChart className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <Textarea
          placeholder="Ask a question about your data (e.g., 'What are the key insights from this data?', 'Show me sales trends', 'Create a summary report')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[80px] resize-none"
          rows={3}
        />
        <Button 
          onClick={handleAnalyze} 
          disabled={loading || !query.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Data'
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {/* Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{result.analysis}</p>
            </CardContent>
          </Card>

          {/* Insights */}
          {result.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Suggested Charts */}
          {result.suggested_charts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested Visualizations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.suggested_charts.map((chart, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getChartIcon(chart.type)}
                        <span className="font-medium text-sm">{chart.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {chart.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {chart.description}
                      </p>
                      {chart.data_columns.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {chart.data_columns.map((col, colIndex) => (
                            <Badge key={colIndex} variant="outline" className="text-xs">
                              {col}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}