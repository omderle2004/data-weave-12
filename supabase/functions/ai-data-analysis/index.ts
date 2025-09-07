import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataAnalysisRequest {
  question: string;
  data: any[][];
  columns: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, data, columns }: DataAnalysisRequest = await req.json();
    
    console.log('Received analysis request:', { question, dataRows: data.length, columns });

    // Create a sample of the data for context (first 5 rows)
    const dataSample = data.slice(0, Math.min(5, data.length));
    const dataContext = `Dataset has ${data.length} rows and ${columns.length} columns: ${columns.join(', ')}\n\nSample data:\n${dataSample.map(row => columns.map((col, i) => `${col}: ${row[i]}`).join(', ')).join('\n')}`;

    // Generate analysis using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a data analyst AI. Analyze the provided dataset and answer user questions with insights, statistics, and chart recommendations.

Dataset context: ${dataContext}

Respond with a JSON object containing:
{
  "answer": "Natural language explanation of findings",
  "insights": ["Key insight 1", "Key insight 2", ...],
  "chartRecommendation": {
    "type": "bar|line|pie|scatter|area",
    "xColumn": "column name for x-axis",
    "yColumn": "column name for y-axis",
    "title": "Chart title"
  },
  "statistics": {
    "key": "value"
  }
}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    // Process the data based on the AI's recommendations
    let processedData = null;
    let chartData = null;

    if (analysisResult.chartRecommendation) {
      const { type, xColumn, yColumn } = analysisResult.chartRecommendation;
      
      // Find column indices
      const xIndex = columns.indexOf(xColumn);
      const yIndex = columns.indexOf(yColumn);

      if (xIndex !== -1 && yIndex !== -1) {
        // Process data for the recommended chart
        if (type === 'bar' || type === 'line') {
          const groupedData = new Map();
          
          data.slice(1).forEach(row => { // Skip header row
            const xVal = row[xIndex];
            const yVal = parseFloat(row[yIndex]) || 0;
            
            if (groupedData.has(xVal)) {
              groupedData.set(xVal, groupedData.get(xVal) + yVal);
            } else {
              groupedData.set(xVal, yVal);
            }
          });

          chartData = Array.from(groupedData.entries()).map(([name, value]) => ({
            name: String(name),
            value: value
          }));
        } else if (type === 'pie') {
          const counts = new Map();
          
          data.slice(1).forEach(row => {
            const val = row[xIndex];
            counts.set(val, (counts.get(val) || 0) + 1);
          });

          chartData = Array.from(counts.entries()).map(([name, value]) => ({
            name: String(name),
            value: value
          }));
        }
      }
    }

    // Calculate basic statistics
    const numericColumns = columns.map((col, index) => {
      const values = data.slice(1).map(row => parseFloat(row[index])).filter(val => !isNaN(val));
      if (values.length > 0) {
        return {
          column: col,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
      return null;
    }).filter(Boolean);

    const result = {
      answer: analysisResult.answer,
      insights: analysisResult.insights || [],
      chartRecommendation: analysisResult.chartRecommendation,
      chartData: chartData,
      statistics: {
        totalRows: data.length - 1,
        totalColumns: columns.length,
        numericColumns: numericColumns,
        ...analysisResult.statistics
      },
      timestamp: new Date().toISOString()
    };

    console.log('Analysis complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-data-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      answer: "I apologize, but I encountered an error while analyzing your data. Please try rephrasing your question or check your data format."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});