import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const body = await req.json();
    
    // Check if this is a time series analysis request
    if (body.timeSeriesAnalysis) {
      const { trend, seasonality, forecast, rSquared, dateColumn, valueColumn } = body;
      
      console.log('Generating time series description for:', { trend, seasonality, forecast, rSquared, dateColumn, valueColumn });

      const trendText = trend === 'increasing' ? 'upward' : trend === 'decreasing' ? 'downward' : 'stable';
      const seasonalText = seasonality ? 'with seasonal patterns' : 'without clear seasonality';
      const confidenceText = rSquared > 0.7 ? 'high' : rSquared > 0.4 ? 'moderate' : 'low';
      
      const forecastValues = forecast.map((f: any) => f.value.toFixed(2)).join(', ');
      
      const prompt = `You are an AI time series analyst. Analyze this time series forecasting result and provide a clear, business-friendly interpretation:

Time Series Analysis:
- Trend: ${trendText}
- Seasonality: ${seasonalText}
- R² Score: ${rSquared} (${(rSquared * 100).toFixed(1)}%)
- Date Column: ${dateColumn}
- Value Column: ${valueColumn}
- Next 3 Forecast Values: ${forecastValues}
- Model Confidence: ${confidenceText}

Please provide a concise paragraph (2-3 sentences) that explains:
1. The historical trend and patterns observed
2. What the forecast predicts for the future
3. Confidence level and business implications
4. Any anomalies or interesting patterns detected

Keep the language simple and actionable for business users. Focus on insights that can drive business decisions.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a time series analysis expert who explains forecasting results in simple, business-friendly terms.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 250,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const description = data.choices[0].message.content.trim();
      
      console.log('Generated time series description:', description);

      return new Response(JSON.stringify({ description }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Original prediction analysis logic
      const { slope, intercept, rSquared, xColumn, yColumn } = body;
      
      console.log('Generating prediction description for:', { slope, intercept, rSquared, xColumn, yColumn });

      // Determine correlation type and strength
      const correlation = slope > 0 ? 'positive' : 'negative';
      const strength = rSquared > 0.7 ? 'strong' : rSquared > 0.4 ? 'moderate' : 'weak';

      const prompt = `You are a data analyst providing insights on a linear regression analysis. Given the following regression results:

- Slope: ${slope}
- Intercept: ${intercept}
- R² Score: ${rSquared} (${(rSquared * 100).toFixed(1)}%)
- Independent Variable (X): ${xColumn}
- Dependent Variable (Y): ${yColumn}

Generate a clear, concise interpretation of the relationship between these variables. Include:
1. The type of correlation (positive/negative)
2. The strength of the relationship based on R² score
3. What this means in practical terms
4. A simple prediction statement

Keep the response under 3 sentences and use business-friendly language.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a data analyst expert who explains statistical relationships in clear, business-friendly terms.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const description = data.choices[0].message.content.trim();

      console.log('Generated description:', description);

      return new Response(JSON.stringify({ description }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in generate-prediction-description function:', error);
    
    // Return fallback description
    const fallbackDescription = "Analysis shows a correlation between the selected variables. The R² score indicates the strength of the predictive relationship.";
    
    return new Response(JSON.stringify({ description: fallbackDescription }), {
      status: 200, // Return 200 to avoid breaking the UI
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});