import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  data: any[];
  title: string;
  xAxis?: string;
  yAxis?: string;
}

interface AIInsight {
  type: 'growth' | 'quality' | 'action';
  title: string;
  description: string;
  confidence?: number;
}

interface BIAnalysisResult {
  statistics: {
    mean?: number;
    median?: number;
    stdDev?: number;
    variance?: number;
    totalRecords: number;
  };
  charts: ChartData[];
  insights: AIInsight[];
  qualityScore: number;
}

export function useBIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeData = async (data: any[][], columns: string[], selectedRevenueColumn?: string, selectedCategoryColumn?: string): Promise<BIAnalysisResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('ai-bi-analysis', {
        body: { data, columns, selectedRevenueColumn, selectedCategoryColumn }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeData, loading, error };
}