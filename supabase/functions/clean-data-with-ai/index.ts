import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data: spreadsheetData, projectId } = await req.json();

    if (!spreadsheetData || !Array.isArray(spreadsheetData)) {
      throw new Error('Invalid spreadsheet data provided');
    }

    console.log('Processing data cleaning request for project:', projectId);

    // Analyze data quality issues
    const analysisResult = analyzeDataQuality(spreadsheetData);
    
    // Clean data with AI assistance
    const cleanedData = await cleanDataWithGemini(spreadsheetData, analysisResult);
    
    // Update project in database if projectId provided
    if (projectId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          spreadsheet_data: cleanedData.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project:', updateError);
        throw new Error('Failed to save cleaned data');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      cleanedData: cleanedData.data,
      summary: cleanedData.summary,
      qualityScore: calculateQualityScore(cleanedData.data)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in clean-data-with-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processLargeDataset(data: string[][], analysis: any, projectId?: string) {
  try {
    const qualityAnalysis = analyzeDataQuality(data);
    const cleaningResult = await cleanDataWithGemini(data, qualityAnalysis);
    
    if (projectId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('projects')
          .update({ 
            data: cleaningResult.cleanedData,
            quality_score: calculateQualityScore(cleaningResult.cleanedData),
            status: 'completed'
          })
          .eq('id', projectId);
      }
    }
    
    console.log('Large dataset processing completed');
    return cleaningResult;
  } catch (error) {
    console.error('Background processing failed:', error);
  }
}

function analyzeDataQuality(data: string[][]) {
  const issues = {
    missingValues: 0,
    duplicateRows: 0,
    dataTypeIssues: 0,
    inconsistentFormats: 0
  };

  const seenRows = new Set();
  
  data.forEach((row, rowIndex) => {
    // Check for missing values
    row.forEach(cell => {
      if (!cell || cell.trim() === '' || cell.toLowerCase() === 'null' || cell.toLowerCase() === 'n/a') {
        issues.missingValues++;
      }
    });

    // Check for duplicates
    const rowString = row.join('|');
    if (seenRows.has(rowString)) {
      issues.duplicateRows++;
    } else {
      seenRows.add(rowString);
    }

    // Check for data type inconsistencies (basic)
    row.forEach((cell, colIndex) => {
      if (rowIndex > 0 && cell) { // Skip header row
        // Simple date format check
        if (cell.includes('/') && cell.includes('-')) {
          issues.inconsistentFormats++;
        }
      }
    });
  });

  return issues;
}

async function cleanDataWithGemini(data: string[][], analysis: any) {
  if (!geminiApiKey) {
    return fallbackDataCleaning(data, analysis);
  }

  try {
    const prompt = `
You are a data cleaning expert. Clean the following dataset based on these issues:
- Missing values: ${analysis.missingValues}
- Duplicate rows: ${analysis.duplicateRows}
- Data type issues: ${analysis.dataTypeIssues}

Rules for cleaning:
1. Fill missing values intelligently based on context
2. Remove exact duplicate rows
3. Standardize date formats to YYYY-MM-DD
4. Maintain data integrity and relationships

Dataset (first 5 rows for context):
${JSON.stringify(data.slice(0, 5))}

Return only valid JSON with this structure:
{
  "cleanedData": [...],
  "changesSummary": {
    "rowsRemoved": number,
    "valuesFilled": number,
    "formatsStandardized": number
  }
}
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const cleanedText = result.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        data: parsed.cleanedData || data,
        summary: parsed.changesSummary || { rowsRemoved: 0, valuesFilled: 0, formatsStandardized: 0 }
      };
    }
    
    throw new Error('Unable to parse Gemini response');

  } catch (error) {
    console.error('Gemini AI cleaning failed, using fallback:', error);
    return fallbackDataCleaning(data, analysis);
  }
}

function fallbackDataCleaning(data: string[][], analysis: any) {
  const cleanedData = [...data];
  const summary = { rowsRemoved: 0, valuesFilled: 0, formatsStandardized: 0 };

  // Remove duplicate rows
  const seenRows = new Set();
  const uniqueData = cleanedData.filter(row => {
    const rowString = row.join('|');
    if (seenRows.has(rowString)) {
      summary.rowsRemoved++;
      return false;
    }
    seenRows.add(rowString);
    return true;
  });

  // Fill missing values with simple strategies
  uniqueData.forEach((row, rowIndex) => {
    if (rowIndex === 0) return; // Skip header

    row.forEach((cell, colIndex) => {
      if (!cell || cell.trim() === '' || cell.toLowerCase() === 'null') {
        // Simple fill strategy - use "N/A" for text, 0 for numbers
        const column = uniqueData.map(r => r[colIndex]).filter(c => c && c.trim());
        const isNumeric = column.some(c => !isNaN(Number(c)));
        
        uniqueData[rowIndex][colIndex] = isNumeric ? '0' : 'N/A';
        summary.valuesFilled++;
      }
    });
  });

  return { data: uniqueData, summary };
}

function calculateQualityScore(data: string[][]) {
  if (!data || data.length === 0) return 0;

  let totalCells = 0;
  let goodCells = 0;

  data.forEach(row => {
    row.forEach(cell => {
      totalCells++;
      if (cell && cell.trim() !== '' && cell.toLowerCase() !== 'null' && cell.toLowerCase() !== 'n/a') {
        goodCells++;
      }
    });
  });

  return Math.round((goodCells / totalCells) * 100);
}