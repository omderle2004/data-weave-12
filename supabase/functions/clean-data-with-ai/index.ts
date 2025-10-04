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
    const { data: spreadsheetData, projectId, options } = await req.json();

    if (!spreadsheetData || !Array.isArray(spreadsheetData)) {
      throw new Error('Invalid spreadsheet data provided');
    }

    console.log('Processing data cleaning request for project:', projectId);

    // Analyze data quality issues
    const analysisResult = analyzeDataQuality(spreadsheetData);
    
    // Clean data using user-selected methods
    const cleanedData = cleanDataWithUserMethods(spreadsheetData, options || {});
    
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

function detectColumnType(data: string[][], colIndex: number): 'numeric' | 'text' | 'date' {
  if (data.length < 2) return 'text';
  
  const sampleValues = data.slice(1, Math.min(20, data.length)).map(row => row[colIndex]);
  const validValues = sampleValues.filter(v => v !== null && v !== undefined && v !== '');
  
  if (validValues.length === 0) return 'text';
  
  // Check if numeric
  const numericCount = validValues.filter(v => !isNaN(Number(v))).length;
  if (numericCount / validValues.length > 0.8) return 'numeric';
  
  // Check if date
  const dateCount = validValues.filter(v => {
    const parsed = new Date(v);
    return !isNaN(parsed.getTime());
  }).length;
  if (dateCount / validValues.length > 0.8) return 'date';
  
  return 'text';
}

function calculateMean(values: number[]): number {
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function calculateMode(values: any[]): any {
  const frequency: Record<string, number> = {};
  values.forEach(val => {
    const key = String(val);
    frequency[key] = (frequency[key] || 0) + 1;
  });
  let maxFreq = 0;
  let mode = values[0];
  Object.entries(frequency).forEach(([key, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = key;
    }
  });
  return mode;
}

function cleanDataWithUserMethods(data: string[][], options: any) {
  const cleanedData = [...data];
  const summary = { rowsRemoved: 0, valuesFilled: 0, formatsStandardized: 0 };

  const { numericMethod = 'mean', textMethod = 'na', dateMethod = 'today' } = options;

  // Remove duplicates first
  const seenRows = new Set<string>();
  const headers = cleanedData[0];
  const uniqueRows = [headers];

  for (let i = 1; i < cleanedData.length; i++) {
    const rowString = cleanedData[i].join('|');
    if (!seenRows.has(rowString)) {
      seenRows.add(rowString);
      uniqueRows.push(cleanedData[i]);
    } else {
      summary.rowsRemoved++;
    }
  }

  // Handle missing values per column based on type and user selection
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const colType = detectColumnType(uniqueRows, colIndex);
    
    const validValues = uniqueRows.slice(1).map((row, rowIdx) => ({ value: row[colIndex], rowIdx: rowIdx + 1 }))
      .filter(item => item.value !== null && item.value !== undefined && item.value !== '');

    let fillValue: any;

    if (colType === 'numeric') {
      const numericValues = validValues.map(item => Number(item.value));
      switch (numericMethod) {
        case 'mean':
          fillValue = calculateMean(numericValues);
          break;
        case 'median':
          fillValue = calculateMedian(numericValues);
          break;
        case 'mode':
          fillValue = calculateMode(numericValues);
          break;
      }
    } else if (colType === 'text') {
      switch (textMethod) {
        case 'na':
          fillValue = 'N/A';
          break;
        case 'mode':
          fillValue = calculateMode(validValues.map(item => item.value));
          break;
      }
    } else if (colType === 'date') {
      switch (dateMethod) {
        case 'today':
          fillValue = new Date().toISOString().split('T')[0];
          break;
      }
    }

    // Apply forward fill or backward fill
    if (numericMethod === 'ffill' || textMethod === 'ffill' || dateMethod === 'ffill') {
      let lastValid: any = null;
      for (let i = 1; i < uniqueRows.length; i++) {
        if (uniqueRows[i][colIndex] !== null && uniqueRows[i][colIndex] !== undefined && uniqueRows[i][colIndex] !== '') {
          lastValid = uniqueRows[i][colIndex];
        } else if (lastValid !== null) {
          uniqueRows[i][colIndex] = lastValid;
          summary.valuesFilled++;
        }
      }
    } else if (dateMethod === 'bfill') {
      let nextValid: any = null;
      for (let i = uniqueRows.length - 1; i >= 1; i--) {
        if (uniqueRows[i][colIndex] !== null && uniqueRows[i][colIndex] !== undefined && uniqueRows[i][colIndex] !== '') {
          nextValid = uniqueRows[i][colIndex];
        } else if (nextValid !== null) {
          uniqueRows[i][colIndex] = nextValid;
          summary.valuesFilled++;
        }
      }
    } else if (dateMethod === 'interpolate' && colType === 'date') {
      // Simple linear interpolation for dates
      for (let i = 1; i < uniqueRows.length; i++) {
        if (!uniqueRows[i][colIndex] || uniqueRows[i][colIndex] === '') {
          const prevIdx = i - 1;
          let nextIdx = i + 1;
          while (nextIdx < uniqueRows.length && (!uniqueRows[nextIdx][colIndex] || uniqueRows[nextIdx][colIndex] === '')) {
            nextIdx++;
          }
          if (prevIdx >= 1 && nextIdx < uniqueRows.length) {
            const prevDate = new Date(uniqueRows[prevIdx][colIndex]);
            const nextDate = new Date(uniqueRows[nextIdx][colIndex]);
            const steps = nextIdx - prevIdx;
            const interpolatedDate = new Date(prevDate.getTime() + ((nextDate.getTime() - prevDate.getTime()) / steps));
            uniqueRows[i][colIndex] = interpolatedDate.toISOString().split('T')[0];
            summary.valuesFilled++;
          }
        }
      }
    } else if (fillValue !== undefined) {
      // Apply calculated fill value
      for (let i = 1; i < uniqueRows.length; i++) {
        if (!uniqueRows[i][colIndex] || uniqueRows[i][colIndex] === '') {
          uniqueRows[i][colIndex] = fillValue;
          summary.valuesFilled++;
        }
      }
    }
  }

  return { data: uniqueRows, summary };
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
      const cellStr = String(cell || '');
      if (!cell || cellStr.trim() === '' || cellStr.toLowerCase() === 'null' || cellStr.toLowerCase() === 'n/a') {
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
        const cellStr = String(cell);
        // Simple date format check
        if (cellStr.includes('/') && cellStr.includes('-')) {
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
      const cellStr = String(cell || '');
      if (!cell || cellStr.trim() === '' || cellStr.toLowerCase() === 'null') {
        // Simple fill strategy - use "N/A" for text, 0 for numbers
        const column = uniqueData.map(r => r[colIndex]).filter(c => {
          const cStr = String(c || '');
          return c && cStr.trim();
        });
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
      const cellStr = String(cell || '');
      if (cell && cellStr.trim() !== '' && cellStr.toLowerCase() !== 'null' && cellStr.toLowerCase() !== 'n/a') {
        goodCells++;
      }
    });
  });

  return Math.round((goodCells / totalCells) * 100);
}