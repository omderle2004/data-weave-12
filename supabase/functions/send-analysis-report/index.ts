import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendReportRequest {
  recipientEmail: string;
  projectName: string;
  pdfBase64?: string;
  hasAnalysis: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, projectName, pdfBase64, hasAnalysis }: SendReportRequest = await req.json();

    console.log('Sending analysis report to:', recipientEmail);
    console.log('Has analysis:', hasAnalysis);
    console.log('Has PDF:', !!pdfBase64);

    // Prepare email content based on whether analysis exists
    let emailHtml: string;
    let emailSubject: string;
    let attachments: any[] = [];

    if (!hasAnalysis) {
      emailSubject = `SmartBiz Analysis Report - ${projectName}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">SmartBiz Analysis Report</h1>
          <p style="color: #666; font-size: 16px;">Project: <strong>${projectName}</strong></p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #666;">
              No analysis found. Please ask a question to generate insights.
            </p>
          </div>
          <p style="color: #666; font-size: 14px;">
            To generate analysis, open your project in SmartBiz and use the AI analysis features to ask questions about your data.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This email was sent from SmartBiz AI Analytics Platform
          </p>
        </div>
      `;
    } else {
      emailSubject = `SmartBiz Analysis Report - ${projectName}`;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">SmartBiz Analysis Report</h1>
          <p style="color: #666; font-size: 16px;">Project: <strong>${projectName}</strong></p>
          <p style="color: #666; font-size: 14px;">
            Please find attached your comprehensive SmartBiz Analysis Report. This report contains all your AI-generated insights, charts, and recommendations.
          </p>
          <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Report Contents:</h3>
            <ul style="color: #666;">
              <li>AI-generated insights and analysis</li>
              <li>Data visualizations and charts</li>
              <li>Key statistics and metrics</li>
              <li>Recommendations and findings</li>
            </ul>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This email was sent from SmartBiz AI Analytics Platform
          </p>
        </div>
      `;

      // Add PDF attachment if provided
      if (pdfBase64) {
        attachments.push({
          filename: `${projectName.replace(/[^a-z0-9]/gi, '_')}_Analysis_Report.pdf`,
          content: pdfBase64.split(',')[1] || pdfBase64, // Remove data:application/pdf;base64, if present
        });
      }
    }

    const emailResponse = await resend.emails.send({
      from: "SmartBiz AI <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: emailSubject,
      html: emailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Report sent successfully',
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-analysis-report function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
