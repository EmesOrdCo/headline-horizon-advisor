
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const EmailConfirmation = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useSEO({
    title: "Email Confirmation",
    description: "Confirm your email address to complete your MarketSensorAI account setup and access AI-powered market insights.",
    canonical: "https://yourdomain.com/email-confirmation",
    noindex: true
  });

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      console.log('Email confirmation page loaded');
      
      // Get the token and type from URL parameters
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      console.log('Token:', token, 'Type:', type);
      
      if (!token || type !== 'signup') {
        console.log('Invalid confirmation link');
        setError('Invalid confirmation link');
        setLoading(false);
        return;
      }

      try {
        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setError(error.message);
          
          toast({
            title: "Confirmation Failed",
            description: error.message,
            variant: "destructive",
          });
          
          // Redirect back to signup after a delay
          setTimeout(() => {
            navigate('/onboarding/email');
          }, 3000);
          return;
        }

        if (data.user) {
          console.log('Email confirmed successfully for user:', data.user.email);
          
          // Create profile if it doesn't exist
          try {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .single();

            if (!existingProfile) {
              console.log('Creating profile for confirmed user');
              await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  full_name: data.user.user_metadata?.full_name || '',
                  onboarding_completed: false
                });
            }
          } catch (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't block the flow for profile creation errors
          }

          toast({
            title: "Email Confirmed!",
            description: "Your email has been confirmed successfully. Please complete your profile.",
          });

          // Redirect to details page after successful confirmation
          navigate('/onboarding/details');
        }
      } catch (err) {
        console.error('Unexpected error during confirmation:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-emerald-600 dark:text-emerald-400 text-xl font-semibold mb-2">
            Confirming your email...
          </div>
          <div className="text-slate-600 dark:text-slate-400">
            Please wait while we confirm your email address.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">
            Confirmation Failed
          </div>
          <div className="text-slate-600 dark:text-slate-400 mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/onboarding/email')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default EmailConfirmation;
