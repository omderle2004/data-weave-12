import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, data } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Analyzing data:', { query, dataKeys: Object.keys(data) });

    // Prepare data summary for AI
    const dataSummary = Object.entries(data).slice(0, 50).map(([cell, value]) => `${cell}: ${value}`).join('\n');
    
    const systemPrompt = `You are an AI data analyst. Analyze the provided spreadsheet data and answer user questions.
    
Available data sample:
${dataSummary}

Provide insights, calculations, or visualizations suggestions based on the data. If the user asks for charts, suggest appropriate chart types and data to visualize.

Format your response as JSON with these fields:
- analysis: string (your text analysis)
- suggested_charts: array of objects with {type, title, description, data_columns}
- insights: array of key insights`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Question: ${query}` }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    // Try to parse as JSON, fallback to plain text
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      parsedResponse = {
        analysis: content,
        suggested_charts: [],
        insights: []
      };
    }

    console.log('AI analysis completed');

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-analyze-data function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: "I'm unable to analyze the data at the moment. Please ensure your OpenAI API key is configured properly.",
      suggested_charts: [],
      insights: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});