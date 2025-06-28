
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { supabase } from "@/integrations/supabase/client";

const OnboardingWelcome = () => {
  const [userName, setUserName] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/onboarding/email');
      return;
    }

    const fetchUserName = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (data && data.first_name) {
        setUserName(data.first_name);
      }
    };

    fetchUserName();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      navigate('/onboarding/stocks');
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <OnboardingProgressBar currentStep={3} totalSteps={5} />
        
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <div className="text-6xl">🎉</div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Welcome to StockPredict AI
                </h1>
                {userName && (
                  <h2 className="text-xl text-emerald-600 dark:text-emerald-400 font-semibold">
                    {userName}!
                  </h2>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Get ready to make smarter investment decisions with AI-powered insights
              </p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
