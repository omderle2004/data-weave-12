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

    // Validate data before processing
    if (!data || data.length < 2) {
      return new Response(JSON.stringify({ 
        error: "Unable to generate this analysis. Please check if your dataset contains the required data.",
        answer: "Your dataset appears to be empty or contains insufficient data. Please upload a valid dataset with at least one row of data."
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a sample of the data for context (first 10 rows for better understanding)
    const dataSample = data.slice(0, Math.min(10, data.length));
    const dataContext = `Dataset has ${data.length} rows and ${columns.length} columns: ${columns.join(', ')}\n\nSample data (first 10 rows):\n${dataSample.map(row => columns.map((col, i) => `${col}: ${row[i]}`).join(', ')).join('\n')}`;

    // Determine intent - visualization vs table vs analysis
    const intentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a strict data analyst. Analyze the user's question and determine their intent based ONLY on the available dataset.

CRITICAL: Only use columns that exist in this dataset: ${columns.join(', ')}

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "intent": "visualization|table|analysis",
  "requiresChart": boolean,
  "suggestedColumns": ["column1", "column2"],
  "chartType": "bar|line|pie|scatter|area|null"
}

Intent classification:
- "visualization": User wants a chart, graph, plot, or visual representation
- "table": User wants to see data rows, top/bottom items, filtered results  
- "analysis": User wants insights, statistics, or text explanations

If the required columns don't exist in the dataset, set requiresChart to false.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_completion_tokens: 300,
      }),
    });

    if (!intentResponse.ok) {
      throw new Error(`OpenAI Intent API error: ${intentResponse.status}`);
    }

    const intentResult = await intentResponse.json();
    let intentContent = intentResult.choices[0].message.content.trim();
    
    // Clean markdown code blocks if present
    if (intentContent.startsWith('```')) {
      intentContent = intentContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    const intent = JSON.parse(intentContent);

    console.log('Intent detected:', intent);

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
            content: `You are a virtual data analyst AI for SmartBiz. Your role is to provide ACCURATE, DATA-DRIVEN insights.

CRITICAL RULES:
1. ALL analysis must come STRICTLY from the uploaded dataset - NO fabricated or placeholder data
2. ONLY use column names that exist in the dataset: ${columns.join(', ')}
3. If data is insufficient for the query, explicitly state it
4. Always provide actionable recommendations based on findings
5. Validate all calculations against actual data values

Dataset context: ${dataContext}
User Intent: ${intent.intent}
Requires Chart: ${intent.requiresChart}

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "answer": "Clear explanation of findings based on ACTUAL data",
  "insights": ["Data-driven insight 1", "Data-driven insight 2", "Data-driven insight 3"],
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
  "intent": "${intent.intent}",
  "chartRecommendation": ${intent.requiresChart ? `{
    "type": "bar|line|pie|scatter|area",
    "xColumn": "EXACT column name from dataset",
    "yColumn": "EXACT column name from dataset", 
    "title": "Descriptive chart title"
  }` : 'null'},
  "tableData": ${intent.intent === 'table' ? `{
    "columns": ["col1", "col2"],
    "rows": [["val1", "val2"]],
    "title": "Table title"
  }` : 'null'},
  "statistics": {
    "relevant_key": "calculated_value"
  }
}

Guidelines:
- For visualizations: Recommend chart type based on data relationships
- For tables: Show actual data rows with relevant columns
- For analysis: Extract real patterns and trends from the data
- Always include 2-3 actionable recommendations
- If required columns don't exist, state: "Unable to generate this analysis. Please check if your dataset contains the required columns."`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    let analysisContent = aiResponse.choices[0].message.content.trim();
    
    // Clean markdown code blocks if present
    if (analysisContent.startsWith('```')) {
      analysisContent = analysisContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisContent);
      throw new Error('Unable to parse AI analysis. Please try rephrasing your question.');
    }
    
    // Validate that AI didn't hallucinate column names
    if (analysisResult.chartRecommendation) {
      const { xColumn, yColumn } = analysisResult.chartRecommendation;
      if (!columns.includes(xColumn) || (yColumn && !columns.includes(yColumn))) {
        return new Response(JSON.stringify({ 
          error: "Unable to generate this analysis. Please check if your dataset contains the required columns.",
          answer: `The requested columns (${xColumn}, ${yColumn}) don't exist in your dataset. Available columns: ${columns.join(', ')}`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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

    const result = {
      answer: analysisResult.answer,
      insights: analysisResult.insights || [],
      recommendations: analysisResult.recommendations || [],
      intent: analysisResult.intent || 'analysis',
      chartRecommendation: analysisResult.chartRecommendation,
      chartData: chartData,
      tableData: tableData,
      statistics: formattedStatistics,
      timestamp: new Date().toISOString(),
      success: true
    };

    console.log('SmartBiz Analysis complete:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-data-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      answer: "Unable to generate this analysis. Please check if your dataset contains the required columns or try rephrasing your question.",
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});