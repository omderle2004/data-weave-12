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

    // Determine intent - visualization vs table vs analysis with enhanced AI
    const intentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert data analyst AI. Analyze the user's natural language question and determine their intent with high accuracy.

Dataset Context:
- Columns: ${columns.join(', ')}
- Total Rows: ${data.length}
- Sample Data: ${dataSample.map(row => columns.map((col, i) => `${col}: ${row[i]}`).join(', ')).slice(0, 2).join('\n')}

Respond with a JSON object containing:
{
  "intent": "visualization|table|analysis|prediction",
  "requiresChart": boolean,
  "suggestedColumns": ["column1", "column2"],
  "chartType": "bar|line|pie|scatter|area|null"
}

Intent Guidelines:
- "visualization": Keywords like show, plot, chart, graph, visualize, display chart
- "table": Keywords like list, show rows, top items, bottom items, filter, display data
- "analysis": Keywords like analyze, insights, trends, patterns, compare, statistics
- "prediction": Keywords like forecast, predict, future, trend, projection

Chart Type Guidelines:
- bar: Comparing categories, rankings, top/bottom items
- line: Trends over time, sequential data, continuous values
- pie: Proportions, percentages, parts of a whole (limit to <8 categories)
- scatter: Correlation, relationship between two numeric variables
- area: Cumulative trends, volume over time

IMPORTANT: Always select the most appropriate chart type based on data characteristics and user intent.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 300,
      }),
    });

    if (!intentResponse.ok) {
      const errorText = await intentResponse.text();
      console.error('OpenAI Intent API error:', intentResponse.status, errorText);
      throw new Error(`OpenAI Intent API error: ${intentResponse.status}`);
    }

    const intentResult = await intentResponse.json();
    let intent;
    
    try {
      const contentText = intentResult.choices[0].message.content.trim();
      console.log('Raw intent content:', contentText);
      
      // Remove markdown code blocks if present
      const cleanedContent = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      intent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse intent JSON:', parseError);
      console.error('Raw content:', intentResult.choices[0].message.content);
      // Fallback to default intent
      intent = {
        intent: 'visualization',
        requiresChart: true,
        suggestedColumns: [columns[0], columns[1]],
        chartType: 'bar'
      };
    }

    console.log('Intent detected:', intent);

    // Generate analysis using advanced AI model with enhanced context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are SmartBiz AI - an expert business intelligence analyst with deep expertise in data analysis, visualization, and actionable insights.

DATASET CONTEXT:
${dataContext}

USER INTENT: ${intent.intent}
REQUIRES CHART: ${intent.requiresChart}
SUGGESTED COLUMNS: ${intent.suggestedColumns?.join(', ') || 'Auto-detect'}

YOUR TASK:
Analyze the dataset and provide comprehensive, context-aware insights based on the user's question.

RESPONSE FORMAT (JSON):
{
  "answer": "Clear, natural language explanation with specific data-driven findings. Include numbers, percentages, and actionable insights. NEVER use placeholders like 'X%' - always use actual calculated values.",
  "insights": [
    "Specific insight with concrete numbers (e.g., 'Revenue increased by 23.4% in Q2')",
    "Pattern or trend identified in the data",
    "Recommendation or action item based on findings",
    "Risk or opportunity highlighted by the analysis"
  ],
  "intent": "${intent.intent}",
  "chartRecommendation": ${intent.requiresChart ? `{
    "type": "${intent.chartType || 'bar'}",
    "xColumn": "EXACT column name from dataset",
    "yColumn": "EXACT column name for values", 
    "title": "Descriptive chart title"
  }` : 'null'},
  "tableData": ${intent.intent === 'table' ? `{
    "title": "Descriptive table title",
    "columns": ["col1", "col2", "col3"],
    "rows": [["val1", "val2", "val3"]]
  }` : 'null'},
  "statistics": {
    "Total Records": number,
    "Key Metric 1": value,
    "Key Metric 2": value
  },
  "recommendations": [
    "Business recommendation 1",
    "Business recommendation 2"
  ]
}

CRITICAL RULES:
1. NEVER use placeholders or generic values - always calculate actual numbers
2. Use exact column names from: ${columns.join(', ')}
3. Provide 3-5 specific, actionable insights
4. Include business context and implications
5. For charts, select the type that best tells the data story
6. Ensure all statistics are real calculated values, not examples
7. Make insights specific and quantified (avoid vague statements)
8. Focus on what matters most to business decisions

VALIDATION:
- Verify all column names exist in the dataset
- Ensure insights reference actual data patterns
- Confirm recommendations are achievable and relevant`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let analysisResult;
    
    try {
      const contentText = aiResponse.choices[0].message.content.trim();
      console.log('Raw analysis content preview:', contentText.substring(0, 200));
      
      // Remove markdown code blocks if present
      const cleanedContent = contentText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      console.error('Raw content:', aiResponse.choices[0].message.content);
      throw new Error('Failed to parse AI response. Please try rephrasing your question.');
    }

    // Process the data based on the AI's recommendations
    let processedData = null;
    let chartData = null;
    let tableData = null;

    // Handle chart data generation
    if (analysisResult.chartRecommendation) {
      const { type, xColumn, yColumn } = analysisResult.chartRecommendation;
      
      // Find column indices
      const xIndex = columns.indexOf(xColumn);
      const yIndex = columns.indexOf(yColumn);

      console.log(`Chart processing: ${type}, xColumn: ${xColumn} (index: ${xIndex}), yColumn: ${yColumn} (index: ${yIndex})`);

      if (xIndex !== -1) {
        // Process data for the recommended chart
        if (type === 'bar' || type === 'line' || type === 'area') {
          const groupedData = new Map();
          
          data.slice(1).forEach(row => { // Skip header row
            const xVal = String(row[xIndex] || '').trim();
            let yVal = 1; // Default count
            
            if (yIndex !== -1) {
              yVal = parseFloat(String(row[yIndex] || '0').replace(/[^0-9.-]/g, '')) || 0;
            }
            
            if (groupedData.has(xVal)) {
              groupedData.set(xVal, groupedData.get(xVal) + yVal);
            } else {
              groupedData.set(xVal, yVal);
            }
          });

          chartData = Array.from(groupedData.entries())
            .sort(([,a], [,b]) => b - a) // Sort by value descending
            .slice(0, 15) // Limit to top 15 items for readability
            .map(([name, value]) => ({
              name: String(name),
              value: typeof value === 'number' ? Math.round(value * 100) / 100 : value
            }));
            
        } else if (type === 'pie') {
          const counts = new Map();
          
          data.slice(1).forEach(row => {
            const val = String(row[xIndex] || '').trim();
            if (val) {
              counts.set(val, (counts.get(val) || 0) + 1);
            }
          });

          chartData = Array.from(counts.entries())
            .sort(([,a], [,b]) => b - a) // Sort by count descending
            .slice(0, 10) // Limit to top 10 for pie charts
            .map(([name, value]) => ({
              name: String(name),
              value: value
            }));
            
        } else if (type === 'scatter') {
          if (yIndex !== -1) {
            chartData = data.slice(1).map(row => ({
              name: String(row[xIndex] || ''),
              value: parseFloat(String(row[yIndex] || '0').replace(/[^0-9.-]/g, '')) || 0
            })).filter(item => item.name && !isNaN(item.value)).slice(0, 50);
          }
        }
      }
    }

    // Handle table data generation
    if (analysisResult.tableData) {
      const requestedColumns = analysisResult.tableData.columns || columns;
      const columnIndices = requestedColumns.map(col => columns.indexOf(col)).filter(idx => idx !== -1);
      
      if (columnIndices.length > 0) {
        tableData = {
          title: analysisResult.tableData.title || 'Data Table',
          columns: columnIndices.map(idx => columns[idx]),
          rows: data.slice(1, 21).map(row => // Limit to first 20 rows
            columnIndices.map(idx => {
              const val = row[idx];
              return val !== null && val !== undefined ? String(val) : '';
            })
          )
        };
      }
    }

    // Calculate basic statistics
    const numericColumns = columns.map((col, index) => {
      const values = data.slice(1).map(row => parseFloat(String(row[index] || '').replace(/[^0-9.-]/g, ''))).filter(val => !isNaN(val));
      if (values.length > 0) {
        return {
          column: col,
          mean: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
      return null;
    }).filter(Boolean);

    // Format statistics properly
    const formattedStatistics = {
      'Total Rows': data.length - 1,
      'Total Columns': columns.length,
      ...(analysisResult.statistics || {})
    };

    // Add numeric column statistics
    numericColumns.forEach(stat => {
      if (stat) {
        formattedStatistics[`${stat.column} Average`] = stat.mean;
        formattedStatistics[`${stat.column} Range`] = `${stat.min} - ${stat.max}`;
      }
    });

    // Validate outputs - ensure no placeholders or empty responses
    const validatedAnswer = analysisResult.answer && analysisResult.answer.trim() !== '' 
      ? analysisResult.answer 
      : 'Analysis complete. Please see the insights and visualizations below for detailed findings.';

    const validatedInsights = Array.isArray(analysisResult.insights) && analysisResult.insights.length > 0
      ? analysisResult.insights.filter(insight => insight && insight.trim() !== '')
      : ['Data successfully analyzed. Key patterns have been identified in the visualization.'];

    // Ensure we have either chart or table data
    const hasValidOutput = chartData || tableData || validatedInsights.length > 0;
    
    if (!hasValidOutput) {
      throw new Error('Unable to generate meaningful analysis from the provided data and question.');
    }

    const result = {
      answer: validatedAnswer,
      insights: validatedInsights,
      recommendations: analysisResult.recommendations || [],
      intent: analysisResult.intent || 'analysis',
      chartRecommendation: analysisResult.chartRecommendation,
      chartData: chartData,
      tableData: tableData,
      statistics: formattedStatistics,
      timestamp: new Date().toISOString()
    };

    console.log('Analysis complete with validation:', { 
      hasChart: !!chartData, 
      hasTable: !!tableData, 
      insightsCount: validatedInsights.length 
    });

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