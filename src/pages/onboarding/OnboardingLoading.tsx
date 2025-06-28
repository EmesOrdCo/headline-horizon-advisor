
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { supabase } from "@/integrations/supabase/client";

const LOADING_STEPS = [
  { text: "Setting up your personalized dashboard...", duration: 2000 },
  { text: "Loading stock market data...", duration: 2000 },
  { text: "Analyzing your portfolio...", duration: 2000 },
  { text: "Preparing AI insights...", duration: 2000 },
  { text: "Almost ready...", duration: 1000 }
];

const OnboardingLoading = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loadingText, setLoadingText] = useState(LOADING_STEPS[0].text);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/onboarding/email');
      return;
    }

    let currentStepIndex = 0;
    
    const advanceStep = () => {
      if (currentStepIndex < LOADING_STEPS.length - 1) {
        currentStepIndex++;
        setCurrentStep(currentStepIndex);
        setLoadingText(LOADING_STEPS[currentStepIndex].text);
        
        setTimeout(advanceStep, LOADING_STEPS[currentStepIndex].duration);
      } else {
        // Complete onboarding and redirect to dashboard
        completeOnboarding();
      }
    };

    const completeOnboarding = async () => {
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
        
        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        navigate('/dashboard');
      }
    };

    // Start the loading sequence
    setTimeout(advanceStep, LOADING_STEPS[0].duration);

  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <OnboardingProgressBar currentStep={5} totalSteps={5} />
        
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto relative">
                  <div className="absolute inset-0 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Getting everything ready
                </h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 transition-all duration-500">
                  {loadingText}
                </p>
                
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingLoading;
