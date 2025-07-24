import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  type: 'technical' | 'suggestion' | 'help';
  name: string;
  email: string;
  summary: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, name, email, summary, description }: FeedbackRequest = await req.json();

    const getSubject = () => {
      switch (type) {
        case 'technical':
          return `Technical Issue: ${summary}`;
        case 'suggestion':
          return `Suggestion: ${summary}`;
        case 'help':
          return `Help Request: ${summary}`;
        default:
          return `Feedback: ${summary}`;
      }
    };

    const getTypeLabel = () => {
      switch (type) {
        case 'technical':
          return 'Technical Issue';
        case 'suggestion':
          return 'Suggestion';
        case 'help':
          return 'Help Request';
        default:
          return 'Feedback';
      }
    };

    const emailResponse = await resend.emails.send({
      from: "MarketSensorAI <noreply@marketsensor.co.uk>",
      to: ["info@marketsensor.co.uk"],
      subject: getSubject(),
      html: `
        <h2>New ${getTypeLabel()} from ${name}</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Type:</strong> ${getTypeLabel()}</p>
        <p><strong>Summary:</strong> ${summary}</p>
        <div>
          <strong>Description:</strong>
          <p>${description.replace(/\n/g, '<br>')}</p>
        </div>
        <hr>
        <p><em>Sent via MarketSensorAI Feedback System</em></p>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);