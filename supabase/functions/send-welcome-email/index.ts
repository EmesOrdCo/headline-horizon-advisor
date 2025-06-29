
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  isConfirmation?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, isConfirmation }: WelcomeEmailRequest = await req.json();
    const name = firstName || "there";

    const subject = isConfirmation 
      ? "STOCK PREDICT AI: Email Confirmation Required"
      : "STOCK PREDICT AI: Welcome to the Future of Smart Investing!";

    const emailContent = isConfirmation ? 
      // Confirmation email content
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm Your Email - StockPredict AI</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #f8fafc;
            }
            .container { 
              background: white; 
              border-radius: 12px; 
              padding: 40px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
            }
            .logo { 
              font-size: 28px; 
              font-weight: bold; 
              color: #10b981; 
              margin-bottom: 8px; 
            }
            .badge {
              background: #10b981;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            h1 { 
              color: #1e293b; 
              font-size: 32px; 
              margin: 30px 0 20px 0; 
              text-align: center;
            }
            .highlight { 
              color: #10b981; 
              font-weight: 600; 
            }
            .confirmation-box {
              background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
              color: white;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
              text-align: center;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 18px;
              text-align: center;
              margin: 24px 0;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StockPredict AI</div>
              <span class="badge">BETA</span>
            </div>
            
            <h1>Please Confirm Your Email ✅</h1>
            
            <p style="font-size: 18px; text-align: center; color: #64748b; margin-bottom: 30px;">
              Hi ${name}! You're almost ready to start your journey with <span class="highlight">StockPredict AI</span>.
            </p>
            
            <div class="confirmation-box">
              <h3 style="color: #10b981; margin-bottom: 16px;">📧 Email Confirmation Required</h3>
              <p style="margin: 0;">Please check your email inbox and click the confirmation link we sent you to activate your account and complete your setup.</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>💡 What's Next:</strong> After confirming your email, you'll be able to complete your profile and start receiving AI-powered stock predictions!
              </p>
            </div>
            
            <div class="footer">
              <p>Questions? We're here to help! Reply to this email anytime.</p>
              <p style="margin-top: 16px;">
                Welcome to the future of investing,<br>
                <strong>The StockPredict AI Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      ` :
      // Welcome email content
      `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to StockPredict AI</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #f8fafc;
            }
            .container { 
              background: white; 
              border-radius: 12px; 
              padding: 40px; 
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 40px; 
            }
            .logo { 
              font-size: 28px; 
              font-weight: bold; 
              color: #10b981; 
              margin-bottom: 8px; 
            }
            .badge {
              background: #10b981;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            h1 { 
              color: #1e293b; 
              font-size: 32px; 
              margin: 30px 0 20px 0; 
              text-align: center;
            }
            .highlight { 
              color: #10b981; 
              font-weight: 600; 
            }
            .feature-box {
              background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
              color: white;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
            }
            .feature-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 12px;
              color: #10b981;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 18px;
              text-align: center;
              margin: 24px 0;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
            }
            .benefits {
              background: #f1f5f9;
              padding: 24px;
              border-radius: 12px;
              margin: 24px 0;
            }
            .benefit-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .checkmark {
              color: #10b981;
              font-weight: bold;
              margin-right: 12px;
              font-size: 18px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">StockPredict AI</div>
              <span class="badge">BETA</span>
            </div>
            
            <h1>Setup Complete! Welcome ${name}! 🎉</h1>
            
            <p style="font-size: 18px; text-align: center; color: #64748b; margin-bottom: 30px;">
              Congratulations! You've successfully completed your StockPredict AI setup. You're now ready to start making <span class="highlight">smarter, AI-powered investment decisions</span>!
            </p>
            
            <div class="feature-box">
              <div class="feature-title">🚀 You're All Set!</div>
              <p>Your account is now fully activated and ready to use. Start exploring AI-powered predictions, real-time market analysis, and personalized insights tailored just for you.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.lovable.app'}/dashboard" class="cta-button">
                Go to Your Dashboard →
              </a>
            </div>
            
            <div class="benefits">
              <h3 style="color: #1e293b; margin-bottom: 20px;">What You Can Do Now:</h3>
              
              <div class="benefit-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>AI-Powered Predictions</strong><br>
                  Get real-time stock predictions powered by advanced machine learning algorithms
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Market Sentiment Analysis</strong><br>
                  Understand market mood with our comprehensive sentiment tracking
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Personalized Insights</strong><br>
                  Receive tailored recommendations based on your investment preferences
                </div>
              </div>
              
              <div class="benefit-item">
                <span class="checkmark">✓</span>
                <div>
                  <strong>Track Your Stocks</strong><br>
                  Monitor your selected stocks with real-time data and AI analysis
                </div>
              </div>
            </div>
            
            <div style="background: #e0f2fe; border: 1px solid #0284c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0; color: #0c4a6e;">
                <strong>💡 Pro Tip:</strong> Visit your dashboard regularly to stay updated with the latest AI insights and market movements. The more you use StockPredict AI, the better it gets at understanding your investment style!
              </p>
            </div>
            
            <div class="footer">
              <p>Questions? We're here to help! Reply to this email anytime.</p>
              <p style="margin-top: 16px;">
                Happy investing,<br>
                <strong>The StockPredict AI Team</strong>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

    const emailResponse = await resend.emails.send({
      from: "StockPredict AI <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
