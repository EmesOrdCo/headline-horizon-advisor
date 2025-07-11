
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // If still loading auth, wait
      if (loading) {
        return;
      }

      // If no user or session, redirect to auth
      if (!user || !session) {
        console.log('No authenticated user, redirecting to auth');
        navigate('/auth');
        return;
      }

      // If user exists but email not confirmed, redirect to onboarding email
      if (user && !user.email_confirmed_at) {
        console.log('Email not confirmed, redirecting to onboarding email');
        navigate('/onboarding/email');
        return;
      }

      try {
        // Check if profile exists and onboarding is completed
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          // If profile doesn't exist, redirect to details page to create it
          if (error.code === 'PGRST116') {
            console.log('Profile not found, redirecting to details');
            navigate('/onboarding/details');
            return;
          }
        } else if (!data.onboarding_completed) {
          console.log('Onboarding not completed, redirecting to details');
          navigate('/onboarding/details');
          return;
        }

        setCheckingOnboarding(false);
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, session, loading, navigate]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
