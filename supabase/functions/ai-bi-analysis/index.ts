import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  data: any[][];
  columns: string[];
  selectedRevenueColumn?: string;
  selectedCategoryColumn?: string;
  fullDatasetStats?: boolean;
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting BI analysis');
    const { data, columns, selectedRevenueColumn, selectedCategoryColumn, fullDatasetStats = true }: AnalysisRequest = await req.json();

    if (!data || !columns || data.length === 0) {
      throw new Error('Invalid data provided');
    }

    console.log(`Analyzing data with ${data.length} rows and ${columns.length} columns`);

    // Perform statistical analysis
    const statistics = calculateStatistics(data, columns, selectedRevenueColumn);
    
    // Generate charts data
    const charts = generateCharts(data, columns, selectedRevenueColumn, selectedCategoryColumn);
    
    // Calculate data quality score
    const qualityScore = calculateQualityScore(data);
    
    // Generate AI insights
    const insights = await generateAIInsights(data, columns, statistics);

    const result: BIAnalysisResult = {
      statistics,
      charts,
      insights,
      qualityScore
    };

    console.log('BI analysis completed successfully');
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in BI analysis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateStatistics(data: any[][], columns: string[], selectedRevenueColumn?: string) {
  let targetColumnIndex = -1;
  
  // Use selected column if provided, otherwise find first numeric column
  if (selectedRevenueColumn) {
    targetColumnIndex = columns.indexOf(selectedRevenueColumn);
  } else {
    const numericColumns = findNumericColumns(data, columns);
    if (numericColumns.length > 0) {
      targetColumnIndex = numericColumns[0].index;
    }
  }
  
  if (targetColumnIndex === -1) {
    return {
      totalRecords: data.length - 1
    };
  }

  const values = data.slice(1).map(row => parseFloat(row[targetColumnIndex])).filter(val => !isNaN(val));

  if (values.length === 0) {
    return {
      totalRecords: data.length
    };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    stdDev,
    variance,
    totalRecords: data.length
  };
}

function findNumericColumns(data: any[][], columns: string[]) {
  return columns.map((col, index) => {
    const sample = data.slice(0, 10).map(row => row[index]);
    const numericCount = sample.filter(val => 
      val !== null && val !== undefined && val !== '' && !isNaN(parseFloat(val))
    ).length;
    
    return {
      name: col,
      index,
      isNumeric: numericCount > sample.length * 0.7
    };
  }).filter(col => col.isNumeric);
}

function generateCharts(data: any[][], columns: string[], selectedRevenueColumn?: string, selectedCategoryColumn?: string): ChartData[] {
  const charts: ChartData[] = [];

  // Generate revenue trends chart
  let revenueIndex = -1;
  if (selectedRevenueColumn) {
    revenueIndex = columns.indexOf(selectedRevenueColumn);
  } else {
    revenueIndex = findColumnByKeywords(columns, ['revenue', 'sales', 'income', 'earnings', 'profit']);
  }
  
  if (revenueIndex !== -1) {
    const chartData = data.slice(1).map((row, index) => ({
      name: `Period ${index + 1}`,
      value: parseFloat(row[revenueIndex]) || 0
    }));
    
    charts.push({
      type: 'line',
      data: chartData,
      title: selectedRevenueColumn ? `${selectedRevenueColumn} Trends` : 'Revenue Trends',
      xAxis: 'name',
      yAxis: 'value'
    });
  }

  // Generate market share chart
  let categoryIndex = -1;
  if (selectedCategoryColumn) {
    categoryIndex = columns.indexOf(selectedCategoryColumn);
  } else {
    categoryIndex = findColumnByKeywords(columns, ['category', 'type', 'product', 'segment', 'region']);
  }
  
  if (categoryIndex !== -1) {
    const categoryCount: Record<string, number> = {};
    data.slice(1).forEach(row => {
      const category = row[categoryIndex];
      if (category && category.toString().trim()) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    const chartData = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));

    if (chartData.length > 0) {
      charts.push({
        type: 'pie',
        data: chartData,
        title: selectedCategoryColumn ? `${selectedCategoryColumn} Distribution` : 'Market Share',
        xAxis: 'name',
        yAxis: 'value'
      });
    }
  }

  return charts;
}

function findColumnByKeywords(columns: string[], keywords: string[]): number {
  return columns.findIndex(col => 
    keywords.some(keyword => 
      col.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

function calculateQualityScore(data: any[][]): number {
  if (data.length === 0) return 0;
  
  let totalCells = 0;
  let validCells = 0;
  
  data.forEach(row => {
    row.forEach(cell => {
      totalCells++;
      if (cell !== null && cell !== undefined && cell !== '' && cell !== 'NaN') {
        validCells++;
      }
    });
  });
  
  return Math.round((validCells / totalCells) * 100);
}

async function generateAIInsights(data: any[][], columns: string[], statistics: any): Promise<AIInsight[]> {
  if (!openAIApiKey) {
    return generateFallbackInsights(data, statistics);
  }

  try {
    const prompt = `Analyze this business data and provide 3 key insights:
    
Data summary:
- ${data.length} records
- Columns: ${columns.join(', ')}
- Statistics: ${JSON.stringify(statistics)}

Provide insights in the following format:
1. Growth opportunity insight
2. Data quality insight  
3. Actionable recommendation

Keep each insight under 100 characters and focus on business value.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a business intelligence analyst. Provide concise, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';
    
    return parseAIInsights(content);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateFallbackInsights(data, statistics);
  }
}

function parseAIInsights(content: string): AIInsight[] {
  const lines = content.split('\n').filter(line => line.trim());
  const insights: AIInsight[] = [];
  
  lines.forEach((line, index) => {
    if (line.trim()) {
      const type = index === 0 ? 'growth' : index === 1 ? 'quality' : 'action';
      insights.push({
        type,
        title: type === 'growth' ? 'Growth Opportunity' : 
               type === 'quality' ? 'Data Quality' : 'Recommended Actions',
        description: line.replace(/^\d+\.\s*/, '').trim()
      });
    }
  });
  
  return insights.slice(0, 3);
}

function generateFallbackInsights(data: any[][], statistics: any): AIInsight[] {
  return [
    {
      type: 'growth',
      title: 'Growth Opportunity',
      description: `Dataset contains ${data.length} records. Consider trend analysis for growth insights.`
    },
    {
      type: 'quality',
      title: 'Data Quality',
      description: 'Review data completeness and consider enriching missing values for better analysis.'
    },
    {
      type: 'action',
      title: 'Recommended Actions',
      description: 'Focus on data-driven decision making. Set up regular monitoring and reporting.'
    }
  ];
}