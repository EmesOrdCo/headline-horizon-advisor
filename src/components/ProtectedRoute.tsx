
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        if (!loading) {
          navigate('/auth');
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setCheckingOnboarding(false);
          return;
        }

        if (!data.onboarding_completed) {
          navigate('/onboarding/details');
          return;
        }

        setCheckingOnboarding(false);
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setCheckingOnboarding(false);
      }
    };

    if (!loading) {
      checkOnboardingStatus();
    }
  }, [user, loading, navigate]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
