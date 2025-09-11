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
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar' | 'donut' | 'stacked-bar';
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

function findDateTimeColumns(data: any[][], columns: string[]) {
  return columns.map((col, index) => {
    const sample = data.slice(1, Math.min(11, data.length)).map(row => row[index]);
    
    // Check for date/time keywords in column names
    const dateKeywords = ['date', 'day', 'month', 'year', 'time', 'period', 'timestamp', 'created', 'updated', 'modified', 'when'];
    const hasDateKeyword = dateKeywords.some(keyword => 
      col.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Check for date/time patterns in data
    const dateCount = sample.filter(val => {
      if (!val) return false;
      
      const valStr = String(val).trim();
      if (!valStr) return false;
      
      // Extended date patterns
      const datePatterns = [
        /^\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
        /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY
        /^\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY
        /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
        /^\d{1,2}\.\d{1,2}\.\d{2,4}/, // DD.MM.YYYY
        /^\d{4}\.\d{1,2}\.\d{1,2}/, // YYYY.MM.DD
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, // ISO datetime
        /^\d{13}$/, // Unix timestamp (milliseconds)
        /^\d{10}$/, // Unix timestamp (seconds)
      ];
      
      const matchesPattern = datePatterns.some(pattern => pattern.test(valStr));
      const parsedDate = new Date(valStr);
      const isValidDate = !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100;
      
      return matchesPattern || isValidDate;
    }).length;
    
    // More lenient classification for date/time columns
    const isDateTime = (dateCount > sample.length * 0.5) || 
                      (hasDateKeyword && dateCount > sample.length * 0.3) || 
                      (hasDateKeyword && sample.length <= 3 && dateCount > 0);
    
    return {
      name: col,
      index,
      isDateTime,
      confidence: dateCount / sample.length,
      hasKeyword: hasDateKeyword
    };
  }).filter(col => col.isDateTime);
}

function generateCharts(data: any[][], columns: string[], selectedRevenueColumn?: string, selectedCategoryColumn?: string): ChartData[] {
  const charts: ChartData[] = [];
  
  // Find available column types
  const numericColumns = findNumericColumns(data, columns);
  const dateTimeColumns = findDateTimeColumns(data, columns);

  // Generate revenue trends chart
  let revenueIndex = -1;
  if (selectedRevenueColumn) {
    revenueIndex = columns.indexOf(selectedRevenueColumn);
  } else {
    // First try keywords, then fall back to first numeric column
    revenueIndex = findColumnByKeywords(columns, ['revenue', 'sales', 'income', 'earnings', 'profit', 'amount', 'value']);
    if (revenueIndex === -1 && numericColumns.length > 0) {
      revenueIndex = numericColumns[0].index;
    }
  }
  
  if (revenueIndex !== -1) {
    const chartData = data.slice(1).map((row, index) => {
      const value = parseFloat(row[revenueIndex]);
      return {
        name: `Period ${index + 1}`,
        value: isNaN(value) ? 0 : value
      };
    }).filter(item => item.value !== 0); // Remove zero values for cleaner charts
    
    if (chartData.length > 0) {
      charts.push({
        type: 'line',
        data: chartData,
        title: selectedRevenueColumn ? `${selectedRevenueColumn} Trends` : 
               columns[revenueIndex] ? `${columns[revenueIndex]} Trends` : 'Value Trends',
        xAxis: 'name',
        yAxis: 'value'
      });
    }
  }

  // Generate market share chart
  let categoryIndex = -1;
  if (selectedCategoryColumn) {
    categoryIndex = columns.indexOf(selectedCategoryColumn);
  } else {
    categoryIndex = findColumnByKeywords(columns, ['category', 'type', 'product', 'segment', 'region', 'department', 'group']);
  }
  
  if (categoryIndex !== -1) {
    const categoryCount: Record<string, number> = {};
    data.slice(1).forEach(row => {
      const category = row[categoryIndex];
      if (category && category.toString().trim()) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    const chartData = Object.entries(categoryCount)
      .filter(([name, value]) => name && value > 0)
      .map(([name, value]) => ({
        name: name.substring(0, 20), // Truncate long names
        value
      }))
      .sort((a, b) => b.value - a.value) // Sort by value descending
      .slice(0, 10); // Limit to top 10 categories

    if (chartData.length > 0) {
      charts.push({
        type: 'pie',
        data: chartData,
        title: selectedCategoryColumn ? `${selectedCategoryColumn} Distribution` : 
               columns[categoryIndex] ? `${columns[categoryIndex]} Distribution` : 'Category Distribution',
        xAxis: 'name',
        yAxis: 'value'
      });
    }
  }

  // Auto-generate time series chart if date column is available
  if (dateTimeColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateTimeColumns[0];
    const valueCol = numericColumns[0];
    
    const timeSeriesData = data.slice(1)
      .map(row => ({
        date: row[dateCol.index],
        value: parseFloat(row[valueCol.index])
      }))
      .filter(item => item.date && !isNaN(item.value))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        name: new Date(item.date).toLocaleDateString(),
        value: item.value
      }));
    
    if (timeSeriesData.length >= 3) {
      charts.push({
        type: 'area',
        data: timeSeriesData,
        title: `${valueCol.name} over Time`,
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
    // Detect column types for better insights
    const numericColumns = findNumericColumns(data, columns);
    const dateTimeColumns = findDateTimeColumns(data, columns);
    
    const prompt = `Analyze this business dataset and provide 3 key insights:
    
Dataset Overview:
- Total Records: ${data.length - 1}
- Total Columns: ${columns.length}
- Numeric Columns: ${numericColumns.map(c => c.name).join(', ') || 'None'}
- Date/Time Columns: ${dateTimeColumns.map(c => c.name).join(', ') || 'None'}
- Column Names: ${columns.join(', ')}

Statistical Summary: ${JSON.stringify(statistics)}

Provide 3 business insights in this exact format:
1. [Growth/Trend insight - focus on opportunities and patterns]
2. [Data Quality insight - assess completeness and reliability] 
3. [Actionable recommendation - specific next steps]

Requirements:
- Each insight must be under 120 characters
- Focus on business value and actionable intelligence
- Consider time series potential if date columns exist
- Highlight data quality issues if present`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert business intelligence analyst. Provide concise, actionable insights that help businesses make data-driven decisions. Focus on practical recommendations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
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
  const numericColumns = findNumericColumns(data, []);
  const dateTimeColumns = findDateTimeColumns(data, []);
  
  const insights: AIInsight[] = [];
  
  // Growth insight
  if (dateTimeColumns.length > 0 && numericColumns.length > 0) {
    insights.push({
      type: 'growth',
      title: 'Time Series Potential',
      description: `Time-based analysis available! Use ${dateTimeColumns.length} date column(s) with metrics for forecasting.`
    });
  } else {
    insights.push({
      type: 'growth',
      title: 'Growth Opportunity',
      description: `Dataset contains ${data.length - 1} records. Add date columns for trend analysis.`
    });
  }
  
  // Quality insight
  const qualityScore = calculateQualityScore(data);
  if (qualityScore >= 90) {
    insights.push({
      type: 'quality',
      title: 'High Data Quality',
      description: `Excellent data quality (${qualityScore}%). Ready for advanced analytics and ML models.`
    });
  } else if (qualityScore >= 70) {
    insights.push({
      type: 'quality',
      title: 'Good Data Quality',
      description: `Good data quality (${qualityScore}%). Consider cleaning missing values for better insights.`
    });
  } else {
    insights.push({
      type: 'quality',
      title: 'Data Quality Issues',
      description: `Data quality needs improvement (${qualityScore}%). Clean missing/invalid values first.`
    });
  }
  
  // Action insight
  if (dateTimeColumns.length > 0) {
    insights.push({
      type: 'action',
      title: 'Recommended Actions',
      description: 'Set up time series forecasting and automated monitoring for key business metrics.'
    });
  } else {
    insights.push({
      type: 'action',
      title: 'Recommended Actions',
      description: 'Add timestamps to enable trend analysis. Focus on KPI tracking and benchmarking.'
    });
  }
  
  return insights;
}