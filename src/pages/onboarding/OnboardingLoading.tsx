
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const OnboardingLoading = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);

  const sendWelcomeEmail = async () => {
    if (!user?.email) return;
    
    try {
      // Get user's first name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      await supabase.functions.invoke('send-welcome-email', {
        body: { 
          email: user.email, 
          firstName: profile?.first_name,
          isConfirmation: false 
        }
      });
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't block the flow if email fails
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Send welcome email when setup is complete
          sendWelcomeEmail();
          navigate('/dashboard');
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
            StockPredict AI
          </div>
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-emerald-500" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Setting up your account...
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            We're preparing your personalized AI-powered investment dashboard
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {progress}% complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLoading;
